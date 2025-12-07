import pandas as pd

phish = pd.read_csv("phishing.csv")
safe = pd.read_csv("safe.csv")

combined = pd.concat([phish, safe], ignore_index=True)

combined = combined.drop_duplicates()

combined = combined.sample(frac=1, random_state=42).reset_index(drop=True)

combined.to_csv("dataset.csv", index=False)

print("Merged dataset created successfully!")
print("Total URLs:", len(combined))
print("Saved as dataset.csv")
