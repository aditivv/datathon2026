# this is where the API that connects the model to the frontend (website) will go
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import torch
import joblib
import fitz  # PyMuPDF for reading PDFs
import requests
from bs4 import BeautifulSoup
from model import JobPredictor

app = FastAPI()

# ---- CORS ----
# This allows your React app (on port 3000) to talk to this API (on port 8000)
# Without this, the browser will block the request
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- LOAD MODEL + ENCODERS ONCE AT STARTUP ----
# These load into memory when the server starts, not on every request
vectorizer = joblib.load("vectorizer.pkl")
le = joblib.load("label_encoder.pkl")

model = JobPredictor(input_size=5000)
model.load_state_dict(torch.load("model.pth", map_location=torch.device("cpu")))
model.eval()

# ---- HELPER: extract text from uploaded PDF ----
def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text.strip()

# ---- HELPER: scrape job description from URL ----
def scrape_job_description(url: str) -> str:
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        # remove nav, footer, scripts — we only want the main content
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()

        text = soup.get_text(separator=" ", strip=True)
        return text[:5000]  # cap at 5000 chars to avoid overloading TF-IDF
    except Exception as e:
        return ""

# ---- MAIN ENDPOINT ----
@app.post("/predict")
async def predict(
    resume: UploadFile = File(...),    # the uploaded PDF file
    job_url: str = Form(...)           # the job listing URL
):
    # 1. read the uploaded PDF bytes and extract text
    pdf_bytes = await resume.read()
    resume_text = extract_text_from_pdf(pdf_bytes)

    if not resume_text:
        return {"error": "Could not extract text from PDF. Make sure it is not a scanned image."}

    # 2. scrape the job description from the URL
    job_text = scrape_job_description(job_url)

    if not job_text:
        return {"error": "Could not retrieve job description from that URL. Try a different link."}

    # 3. combine them exactly like we did in training
    combined = resume_text + " [SEP] " + job_text

    # 4. convert to TF-IDF numbers using the saved vectorizer
    X = vectorizer.transform([combined]).toarray()
    X_t = torch.FloatTensor(X)

    # 5. run through the model
    with torch.no_grad():
        output = model(X_t)
        predicted_class = output.argmax(dim=1).item()
        probabilities = torch.softmax(output, dim=1)[0].tolist()

    # 6. convert number back to label
    predicted_label = le.inverse_transform([predicted_class])[0]

    # 7. build a confidence score for each class
    confidence_scores = {
        le.classes_[i]: round(probabilities[i] * 100, 1)
        for i in range(len(le.classes_))
    }

    return {
        "prediction": predicted_label,
        "confidence": confidence_scores
    }

# ---- HEALTH CHECK ----
# useful to test that the server is running
@app.get("/")
def root():
    return {"status": "API is running"}