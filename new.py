import shutil
import sys

def file_find_and_replace(file, patterns):
    with open(file, 'r') as f:
        data = f.read()
    for old in patterns:
        new = patterns[old]
        data = data.replace(old, new)
    with open(file, 'w') as f:
        f.write(data)

def copy_file(file, newfile):
    shutil.copytree(file, newfile)


name = '_'.join(sys.argv[1:])
title = name.replace('_', ' ').title()
new_path = f'./src/{name}/'
patterns = {
    'TEMPLATE_NAME': title
}

copy_file('./src/template/', new_path)
file_find_and_replace(f'{new_path}/index.html', patterns)
file_find_and_replace(f'{new_path}/main.js', patterns)
