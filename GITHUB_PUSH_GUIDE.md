# Push to GitHub - Step by Step Commands

## Commands to Run:

### 1. Add Important Files (excluding node_modules)
```powershell
git add .gitignore
git add client/
git add server/
git add vercel.json
git add package.json
git add README.md
git add *.md
```

### 2. Remove node_modules from tracking (if already tracked)
```powershell
git rm -r --cached server/node_modules
git rm -r --cached client/node_modules
git rm -r --cached node_modules
```

### 3. Commit Changes
```powershell
git commit -m "Add MySQL support and update project configuration"
```

### 4. Push to GitHub
```powershell
git push origin main
```

**OR if your branch is called `master`:**
```powershell
git push origin master
```

---

## Quick All-in-One Commands

```powershell
# Check current branch
git branch

# Add all important files
git add .gitignore client/ server/ vercel.json package.json README.md *.md

# Remove node_modules from tracking
git rm -r --cached server/node_modules 2>$null
git rm -r --cached client/node_modules 2>$null
git rm -r --cached node_modules 2>$null

# Commit
git commit -m "Add MySQL support, update server configuration, and add deployment guides"

# Push
git push origin main
```

---

## If You Get Errors:

### "Branch not found" or "main/master doesn't exist"
```powershell
# Check what branch you're on
git branch

# If you need to create main branch
git checkout -b main
git push -u origin main
```

### "Authentication failed"
- Make sure you're logged into GitHub
- You may need to use a Personal Access Token instead of password

### "node_modules still showing"
```powershell
# Force remove from cache
git rm -rf --cached server/node_modules
git rm -rf --cached client/node_modules
git rm -rf --cached node_modules
git commit -m "Remove node_modules from tracking"
```

