import json
import os

notebook = {
    "cells": [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# CONSTRUCT-SAFE AI: Phase 2C Training Run #2\n",
                "This notebook automates downloading the dataset, filtering out noisy classes to create a focused V1 dataset, and training the YOLO11n custom PPE model."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "!pip install ultralytics roboflow\n",
                "from IPython import display\n",
                "display.clear_output()\n",
                "import ultralytics\n",
                "ultralytics.checks()"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 1. Download Dataset"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "import os\n",
                "import urllib.request\n",
                "import zipfile\n",
                "\n",
                "dataset_url = 'https://github.com/ultralytics/assets/releases/download/v0.0.0/construction-ppe.zip'\n",
                "zip_path = 'construction-ppe.zip'\n",
                "extract_dir = '/content/datasets/construction_safety'\n",
                "\n",
                "if not os.path.exists(extract_dir):\n",
                "    urllib.request.urlretrieve(dataset_url, zip_path)\n",
                "    os.makedirs(extract_dir, exist_ok=True)\n",
                "    with zipfile.ZipFile(zip_path, 'r') as zip_ref:\n",
                "        zip_ref.extractall(extract_dir)\n",
                "    os.remove(zip_path)\n",
                "print('Base dataset ready.')"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 2. Filter Dataset for V1\n",
                "Dropping `none`, `no_goggle`, and `no_boots` to focus the model on primary PPE features."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "import shutil\n",
                "import glob\n",
                "\n",
                "remap_dict = {0:0, 1:1, 2:2, 3:3, 4:4, 5:-1, 6:5, 7:6, 8:-1, 9:7, 10:-1}\n",
                "src_dir = extract_dir\n",
                "dst_dir = '/content/datasets/construction_safety_v1'\n",
                "\n",
                "if os.path.exists(dst_dir):\n",
                "    shutil.rmtree(dst_dir)\n",
                "\n",
                "splits = ['train', 'val', 'test']\n",
                "for split in splits:\n",
                "    os.makedirs(f'{dst_dir}/images/{split}', exist_ok=True)\n",
                "    os.makedirs(f'{dst_dir}/labels/{split}', exist_ok=True)\n",
                "    lbls = glob.glob(f'{src_dir}/labels/{split}/*.txt')\n",
                "    for lbl_file in lbls:\n",
                "        base = os.path.basename(lbl_file)\n",
                "        with open(lbl_file, 'r') as f:\n",
                "            lines = f.readlines()\n",
                "        new_lines = []\n",
                "        for line in lines:\n",
                "            p = line.strip().split()\n",
                "            if not p: continue\n",
                "            old_c = int(p[0])\n",
                "            new_c = remap_dict.get(old_c, -1)\n",
                "            if new_c != -1:\n",
                "                new_lines.append(f\"{new_c} {' '.join(p[1:])}\\n\")\n",
                "        with open(f'{dst_dir}/labels/{split}/{base}', 'w') as f:\n",
                "            f.writelines(new_lines)\n",
                "        for ext in ['.jpg', '.jpeg', '.png']:\n",
                "            img = f'{src_dir}/images/{split}/{os.path.splitext(base)[0]}{ext}'\n",
                "            if os.path.exists(img):\n",
                "                shutil.copy(img, f'{dst_dir}/images/{split}/{os.path.splitext(base)[0]}{ext}')\n",
                "                break\n",
                "print('V1 Dataset filtered successfully.')"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 3. Configure Dataset YAML"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "yaml_content = \"\"\"path: /content/datasets/construction_safety_v1\n",
                "train: images/train\n",
                "val: images/val\n",
                "test: images/test\n",
                "names:\n",
                "  0: helmet\n",
                "  1: gloves\n",
                "  2: vest\n",
                "  3: boots\n",
                "  4: goggles\n",
                "  5: Person\n",
                "  6: no_helmet\n",
                "  7: no_gloves\n",
                "\"\"\"\n",
                "with open('dataset_v1.yaml', 'w') as f:\n",
                "    f.write(yaml_content)"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 4. Train Model (Run #2 configuration)"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "from ultralytics import YOLO\n",
                "\n",
                "model = YOLO('yolo11n.pt')\n",
                "\n",
                "results = model.train(\n",
                "    data='dataset_v1.yaml',\n",
                "    epochs=100,\n",
                "    imgsz=800,\n",
                "    batch=16,\n",
                "    device=0,\n",
                "    patience=25,\n",
                "    optimizer='AdamW',\n",
                "    cos_lr=True,\n",
                "    mosaic=1.0,\n",
                "    mixup=0.1,\n",
                "    project='runs',\n",
                "    name='ppe_training_run2',\n",
                "    verbose=True\n",
                ")"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "## 5. Evaluate on Test Set"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "best_model = YOLO('runs/ppe_training_run2/weights/best.pt')\n",
                "metrics = best_model.val(data='dataset_v1.yaml', split='test')\n",
                "print(\"\\nmAP50-95:\", metrics.box.map)\n",
                "print(\"mAP50:\", metrics.box.map50)"
            ]
        }
    ],
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 4
}

os.makedirs(r'c:\Users\Joel Iman\Desktop\Image Rimona Project\training\colab', exist_ok=True)
with open(r'c:\Users\Joel Iman\Desktop\Image Rimona Project\training\colab\CONSTRUCT_SAFE_AI_Training_Run2.ipynb', 'w') as f:
    json.dump(notebook, f, indent=2)
