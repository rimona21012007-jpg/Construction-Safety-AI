import os
import shutil
import glob
from collections import defaultdict

# Original mapping
# 0: helmet, 1: gloves, 2: vest, 3: boots, 4: goggles, 5: none
# 6: Person, 7: no_helmet, 8: no_goggle, 9: no_gloves, 10: no_boots

# V1 Approved Classes (in order to remap 0-7)
# 0: helmet
# 1: gloves
# 2: vest
# 3: boots
# 4: goggles
# 5: Person
# 6: no_helmet
# 7: no_gloves

remap_dict = {
    0: 0, # helmet
    1: 1, # gloves
    2: 2, # vest
    3: 3, # boots
    4: 4, # goggles
    5: -1, # none (DROP)
    6: 5, # Person
    7: 6, # no_helmet
    8: -1, # no_goggle (DROP)
    9: 7, # no_gloves
    10: -1 # no_boots (DROP)
}

v1_names = {
    0: 'helmet', 1: 'gloves', 2: 'vest', 3: 'boots', 
    4: 'goggles', 5: 'Person', 6: 'no_helmet', 7: 'no_gloves'
}

src_dir = r"training\datasets\construction_safety"
dst_dir = r"training\datasets\construction_safety_v1"

print(f"Creating V1 dataset at {dst_dir}...")

if os.path.exists(dst_dir):
    shutil.rmtree(dst_dir)

splits = ['train', 'val', 'test']

annotations_removed = 0
annotations_kept = 0
new_stats = defaultdict(lambda: defaultdict(int))

for split in splits:
    src_img_dir = os.path.join(src_dir, 'images', split)
    src_lbl_dir = os.path.join(src_dir, 'labels', split)
    dst_img_dir = os.path.join(dst_dir, 'images', split)
    dst_lbl_dir = os.path.join(dst_dir, 'labels', split)
    
    os.makedirs(dst_img_dir, exist_ok=True)
    os.makedirs(dst_lbl_dir, exist_ok=True)
    
    # Copy images and filter labels
    if not os.path.exists(src_lbl_dir): continue
    
    label_files = glob.glob(os.path.join(src_lbl_dir, "*.txt"))
    for lbl_file in label_files:
        basename = os.path.basename(lbl_file)
        
        # Read old labels
        with open(lbl_file, 'r') as f:
            lines = f.readlines()
            
        new_lines = []
        for line in lines:
            parts = line.strip().split()
            if not parts: continue
            
            old_cls = int(parts[0])
            new_cls = remap_dict.get(old_cls, -1)
            
            if new_cls == -1:
                annotations_removed += 1
            else:
                annotations_kept += 1
                new_stats[split][new_cls] += 1
                new_lines.append(f"{new_cls} {' '.join(parts[1:])}\\n")
                
        # Write new labels
        with open(os.path.join(dst_lbl_dir, basename), 'w') as f:
            f.writelines(new_lines)
            
        # Copy corresponding image (jpg, png, jpeg)
        img_basename = os.path.splitext(basename)[0]
        # find image extension
        found_img = False
        for ext in ['.jpg', '.jpeg', '.png']:
            img_path = os.path.join(src_img_dir, img_basename + ext)
            if os.path.exists(img_path):
                shutil.copy(img_path, os.path.join(dst_img_dir, img_basename + ext))
                found_img = True
                break

print("\\n--- Filtering Complete ---")
print(f"Annotations Removed: {annotations_removed}")
print(f"Annotations Kept: {annotations_kept}")

print("\\n--- New Dataset Statistics (V1) ---")
for split in splits:
    print(f"\\nSplit: {split}")
    for cls_id in sorted(new_stats[split].keys()):
        print(f"  {v1_names[cls_id]}: {new_stats[split][cls_id]}")

yaml_content = f"""path: ../datasets/construction_safety_v1
train: images/train
val: images/val
test: images/test

names:
  0: helmet
  1: gloves
  2: vest
  3: boots
  4: goggles
  5: Person
  6: no_helmet
  7: no_gloves
"""

with open(r'training\configs\dataset_v1.yaml', 'w') as f:
    f.write(yaml_content)
print("\\nCreated training\\\\configs\\\\dataset_v1.yaml")
