from github import Github
import os

def upload_to_github(token, repo_name, file_path, commit_message, content):
    try:
        # User ke GitHub token se login
        g = Github(token)
        user = g.get_user()
        
        # Check agar repo hai ya nayi banani hai
        try:
            repo = user.get_repo(repo_name)
        except:
            repo = user.create_repo(repo_name)
            
        # File push/edit karna
        try:
            contents = repo.get_contents(file_path)
            repo.update_file(contents.path, commit_message, content, contents.sha)
            return f"Success: File updated in {repo_name}"
        except:
            repo.create_file(file_path, commit_message, content)
            return f"Success: New file created in {repo_name}"
            
    except Exception as e:
        return f"GitHub Error: {str(e)}"
