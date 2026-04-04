import pandas as pd
import torch
import torch.nn as nn
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from model import JobPredictor
import joblib

df = pd.read_parquet("../data/train.parquet")
df["combined"] = df["resume"] + " [SEP] " + df["jd"]

le = LabelEncoder()
y = le.fit_transform(df["label"])
joblib.dump(le, "label_encoder.pkl")

vectorizer = TfidfVectorizer(max_features=5000, stop_words="english")
X = vectorizer.fit_transform(df["combined"]).toarray()
joblib.dump(vectorizer, "vectorizer.pkl")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# convert to tensors ONCE, outside the loop
X_train_t = torch.FloatTensor(X_train)
y_train_t = torch.LongTensor(y_train)
X_test_t  = torch.FloatTensor(X_test)
y_test_t  = torch.LongTensor(y_test)

model = JobPredictor(input_size=X_train.shape[1])
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
loss_fn = nn.CrossEntropyLoss()

EPOCHS     = 50
BATCH_SIZE = 64   # ← only 64 rows processed at a time

for epoch in range(EPOCHS):
    model.train()   # switch to training mode at the start of each epoch
    
    # shuffle the training data at the start of each epoch
    permutation = torch.randperm(X_train_t.size(0))
    X_train_t = X_train_t[permutation]
    y_train_t = y_train_t[permutation]

    epoch_loss = 0
    num_batches = 0

    # step through the data in chunks of BATCH_SIZE
    for i in range(0, X_train_t.size(0), BATCH_SIZE):
        X_batch = X_train_t[i : i + BATCH_SIZE]   # grab rows i to i+32
        y_batch = y_train_t[i : i + BATCH_SIZE]

        pred = model(X_batch)
        loss = loss_fn(pred, y_batch)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        epoch_loss += loss.item()
        num_batches += 1

    if epoch % 10 == 0:
        avg_loss = epoch_loss / num_batches
        print(f"Epoch {epoch}, Avg Loss: {avg_loss:.4f}")

# evaluate
model.eval()
with torch.no_grad():
    test_pred = model(X_test_t)
    accuracy = (test_pred.argmax(dim=1) == y_test_t).float().mean()
    print(f"Test Accuracy: {accuracy:.4f}")
    print(f"Label mapping: {list(le.classes_)}")

torch.save(model.state_dict(), "model.pth")
print("Done! model.pth saved.")