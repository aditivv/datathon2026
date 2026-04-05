import pandas as pd
import torch
import joblib
from model import JobPredictor
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

# ---- LOAD THE SAME DATA ----
df = pd.read_parquet("../data/train.parquet")
df["combined"] = df["resume"] + " [SEP] " + df["jd"]

# ---- LOAD THE SAVED ENCODERS ----
le = joblib.load("label_encoder.pkl")
vectorizer = joblib.load("vectorizer.pkl")

# ---- REPRODUCE THE SAME SPLIT ----
y = le.transform(df["label"])
X = vectorizer.transform(df["combined"]).toarray()

_, X_test, _, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42   # same random_state as train.py = same split!
)

# ---- LOAD THE TRAINED MODEL ----
model = JobPredictor(input_size=X_test.shape[1])
model.load_state_dict(torch.load("model.pth"))
model.eval()

# ---- RUN PREDICTIONS ----
with torch.no_grad():
    X_test_t = torch.FloatTensor(X_test)
    y_test_t = torch.LongTensor(y_test)

    preds = model(X_test_t)
    predicted_classes = preds.argmax(dim=1)

    accuracy = (predicted_classes == y_test_t).float().mean()
    print(f"Overall Accuracy: {accuracy:.4f} ({accuracy*100:.1f}%)\n")

# ---- DETAILED BREAKDOWN ----
y_test_labels = le.inverse_transform(y_test)
y_pred_labels = le.inverse_transform(predicted_classes.numpy())

print("Per-class breakdown:")
print(classification_report(y_test_labels, y_pred_labels))

print("Confusion Matrix:")
print(confusion_matrix(y_test_labels, y_pred_labels))
print(f"Label order: {list(le.classes_)}")