
import os
import glob

def get_file_extension(filepath):
    """Returns the file extension without the leading dot."""
    return os.path.splitext(filepath)[1].lstrip('.')

def generate_code_md(root_dir='.', output_file='code.md'):
    """
    Generates a Markdown file containing the content of all relevant files
    in the codebase, with file paths.
    """
    markdown_content = []
    
    # Exclude common directories and files
    excluded_patterns = [
        '.git/', '__pycache__/', 'node_modules/', 'venv/', 'build/', 'dist/',
        '.vscode/', '.idea/', '.DS_Store', '*.log', '*.pyc',
        output_file, 'code.py' # Exclude itself and the output file
    ]

    all_files = glob.glob(os.path.join(root_dir, '**/*'), recursive=True)
    
    for filepath in sorted(all_files):
        relative_filepath = os.path.relpath(filepath, root_dir)

        # Skip directories and excluded files/directories
        if os.path.isdir(filepath) or any(p in relative_filepath for p in excluded_patterns):
            continue

        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            file_extension = get_file_extension(relative_filepath)
            
            markdown_content.append(f"### `{relative_filepath}`")
            markdown_content.append(f"``` {file_extension}")
            markdown_content.append(content)
            markdown_content.append("```")
            markdown_content.append("\n") # Add a newline between files
        except Exception as e:
            print(f"Error reading file {filepath}: {e}")
            continue

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(markdown_content))

    print(f"Generated {output_file} successfully.")

if __name__ == "__main__":
    generate_code_md()
