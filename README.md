<div align="center">
  <h1>NexaGlint</h1>
  <p><strong>The Reality-First Lakehouse Metastore Viewer</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Status-Beta-cyan?style=for-the-badge" alt="Status" />
    <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="License" />
    <img src="https://img.shields.io/badge/Build-FastAPI_%2B_React-emerald?style=for-the-badge" alt="Build" />
  </p>
</div>

---

NexaGlint is a high-performance, infrastructure-free metastore viewer designed for the modern data lakehouse. It empowers data engineers to bypass heavy infrastructure like Hive Metastore or AWS Glue, providing instant visibility into **Iceberg**, **Delta Lake**, **Hudi**, and **Parquet** tables directly from S3-compatible storage.

## 🌟 Why NexaGlint?

Modern data stacks often suffer from **Metastore Drift**—where the catalog says one thing, but the storage says another. NexaGlint goes straight to the source, parsing transaction logs and manifests in real-time to give you the ground truth.

- **Truth at Source**: No sync delays. What you see is exactly what is in S3.
- **Cost Efficient**: No expensive compute clusters or managed catalogs required.
- **Identity-First**: Use your existing AWS IAM credentials to explore your data estate.

## ✨ Core Capabilities

- 🔍 **Instant Discovery**: Point at a bucket and discover all tables automatically.
- 📐 **Schema Explorer**: Inspect column types, nullability, and partition strategies.
- 🕒 **Time Travel**: Walk through Iceberg snapshots and Delta versions with ease.
- ⚡ **In-Browser SQL**: Analytical querying via DuckDB without leaving the browser.
- 🔔 **Monitoring**: "Watch" critical tables for schema drift and snapshot commits.

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 19, TanStack Start, Tailwind CSS, Lucide |
| **Backend** | Python 3.11, FastAPI, DuckDB |
| **Parsing** | PyIceberg, DeltaLake, PyArrow |
| **Infrastructure** | S3-Compatible Storage (AWS, MinIO, Azure) |

## 🚀 Local Development

### Prerequisites
- Python 3.10+
- Node.js 20+

### 1. Setup Backend
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🌍 Deployment

NexaGlint is designed to be deployed easily on modern cloud platforms:
- **Backend**: Recommended for [Render](https://render.com) (Python Web Service)
- **Frontend**: Recommended for [Vercel](https://vercel.app) (Static Site)

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  Built for the modern Data Engineering community
</div>
