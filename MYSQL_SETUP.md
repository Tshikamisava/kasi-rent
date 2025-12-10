# MySQL Setup Guide for Windows

## Step 1: Install MySQL Server

### Option A: Download MySQL Installer (Recommended)
1. Go to https://dev.mysql.com/downloads/installer/
2. Download **MySQL Installer for Windows** (choose the web installer or full installer)
3. Run the installer and select:
   - **Developer Default** (includes MySQL Server, MySQL Workbench, and other tools)
   - Or **Server only** if you just need the database server
4. During installation:
   - Choose **Standalone MySQL Server**
   - Select **MySQL Server 8.0** (or latest version)
   - Choose **Config Type**: Development Computer
   - Set a **root password** (remember this!)
   - Add MySQL to Windows PATH (recommended)

### Option B: Using Chocolatey (if you have it)
```powershell
choco install mysql
```

### Option C: Using Docker (if you have Docker Desktop)
```powershell
docker run --name mysql-kasirent -e MYSQL_ROOT_PASSWORD=yourpassword -e MYSQL_DATABASE=kasi_rent -p 3306:3306 -d mysql:8.0
```

## Step 2: Start MySQL Service

### Check if MySQL is running:
```powershell
Get-Service -Name MySQL*
```

### Start MySQL service (if not running):
```powershell
# If service name is MySQL80 or MySQL
Start-Service MySQL80
# OR
Start-Service MySQL
```

### Or use Services GUI:
1. Press `Win + R`, type `services.msc` and press Enter
2. Find **MySQL80** or **MySQL** service
3. Right-click → **Start** (if not running)

## Step 3: Create Database

### Method 1: Using MySQL Command Line
1. Open PowerShell or Command Prompt
2. Connect to MySQL:
   ```powershell
   mysql -u root -p
   ```
3. Enter your root password when prompted
4. Create the database:
   ```sql
   CREATE DATABASE kasi_rent;
   SHOW DATABASES;
   EXIT;
   ```

### Method 2: Using MySQL Workbench
1. Open MySQL Workbench (installed with MySQL)
2. Connect to your local MySQL server (localhost:3306)
3. Enter root password
4. Click the "SQL" tab
5. Run:
   ```sql
   CREATE DATABASE kasi_rent;
   ```
6. Click the lightning bolt icon to execute

### Method 3: Let Sequelize Create It (Easier!)
Your Sequelize config will automatically create the database if it doesn't exist. Just make sure:
- MySQL service is running
- Your `.env` file has correct credentials
- The MySQL user has CREATE DATABASE privileges

## Step 4: Configure Your .env File

Create a `.env` file in the `server` directory with:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=kasi_rent

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret_key_here_change_this

# Cloudinary Configuration (for image uploads - optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Important:** Replace `your_mysql_root_password` with the password you set during MySQL installation!

## Step 5: Test the Connection

1. Navigate to your server directory:
   ```powershell
   cd server
   ```

2. Start your server:
   ```powershell
   npm run dev
   ```

3. You should see:
   ```
   ✅ MySQL Connected successfully
   ✅ Database synced
   🚀 Server running on port 5000
   ```

## Troubleshooting

### MySQL service won't start:
- Check if port 3306 is already in use
- Check Windows Event Viewer for MySQL errors
- Try restarting the MySQL service

### Connection refused:
- Make sure MySQL service is running
- Check if firewall is blocking port 3306
- Verify DB_HOST is `localhost` (not `127.0.0.1`)

### Access denied:
- Verify your root password in `.env` matches MySQL root password
- Try resetting MySQL root password if forgotten

### Database doesn't exist:
- Sequelize will create it automatically, OR
- Manually create it using the SQL commands above

## Default MySQL Port
- **Port:** 3306
- **Host:** localhost
- **Default User:** root

