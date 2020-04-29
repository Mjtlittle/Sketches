import shutil

def file_find_and_replace(file, old, new):
    with open(file, 'r') as f:
        data = f.read()
    data = data.replace(old, new)
    with open(file, 'w') as f:
        f.write(data)

name = input('> ').replace(' ', '_')
title = name.replace('_', ' ').title()
shutil.copytree('./src/template/', f'./src/_{name}/')
file_find_and_replace(f'./src/_{name}/index.html', 'TEMPLATE_NAME', title)
file_find_and_replace(f'./src/_{name}/main.js', 'TEMPLATE_NAME', title)
