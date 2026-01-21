
import re

file_path = r"c:\Users\Maruf\Downloads\new-website-main\new-website-main\site_data.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Define new unique gradients
gradients = [
    "hyper-blue", "oceanic", "electric-purple", "neon-pink", "sunset-orange", 
    "forest-green", "crimson-red", "amber-gold", "teal-wave", "violet-storm", 
    "sky-blue", "lime-zest", "fuchsia-pop", "rose-gold", "royal-indigo", 
    "slate-dark", "midnight-blue", "berry-blast", "mint-fresh", "coral-reef", 
    "deep-purple", "azure-sky", "ruby-red", "emerald-city", "golden-hour", 
    "lavender-mist", "steel-gray", "autumn-leaf", "tropical-sea", "cherry-blossom", 
    "galaxy", "jungle", "solar", "ice", "grape", 
    "smoke", "tangerine", "peacock", "lipstick", "obsidian", "aqua"
]

# Find the products array
# We look for 'const products = [' and the closing '];'
start_marker = "const products = ["
end_marker = "];"

start_idx = content.find(start_marker)
if start_idx == -1:
    print("Error: products array not found")
    exit(1)

# Find the end of the products array. 
# Since there might be nested brackets, we need to be careful.
# But looking at the file structure, the products array ends before "// Blog Posts"
# simpler approach: iterate through the file line by line within the products block

lines = content.split('\n')
new_lines = []
in_products = False
product_count = 0

for line in lines:
    if "const products = [" in line:
        in_products = True
        new_lines.append(line)
        continue
    
    if in_products and line.strip() == "];":
        in_products = False
        new_lines.append(line)
        continue
        
    if in_products:
        # Check if line has badge_color
        if '"badge_color":' in line:
            # Replace the color
            current_color = gradients[product_count % len(gradients)]
            # Preserve indentation
            indent = line.split('"')[0]
            new_line = f'{indent}"badge_color": "{current_color}",'
            new_lines.append(new_line)
            
            # Increment count only when we see a badge_color (assuming 1 per product)
            product_count += 1
        else:
            new_lines.append(line)
    else:
        new_lines.append(line)

new_content = '\n'.join(new_lines)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"Updated {product_count} products with unique colors.")
