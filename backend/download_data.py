from datasets import load_dataset

dataset = load_dataset("med2425/resume-job-fit-merged-v1")

# save the train split as a parquet file
dataset["train"].to_parquet("../data/train.parquet")

print("Done! train.parquet saved to data folder.")