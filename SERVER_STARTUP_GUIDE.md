# 🚀 Disaster Management Server Startup Guide

## **Quick Start Options:**

### **Option 1: Double-Click to Start (Easiest)**
1. **Double-click** `start_server.bat` file
2. Server starts automatically on `http://127.0.0.1:8000`
3. Keep the window open while using the system

### **Option 2: PowerShell Script (Recommended)**
1. **Right-click** `start_server.ps1` 
2. Select **"Run with PowerShell"**
3. Server starts with dependency checks

### **Option 3: Manual Command**
```bash
python app.py
```

## **🔄 Auto-Start Solutions:**

### **Solution A: Windows Startup Folder**
1. Press `Win + R`, type `shell:startup`
2. Copy `start_server.bat` to the startup folder
3. Server will start automatically when Windows boots

### **Solution B: Windows Service (Professional)**
1. Download NSSM from: https://nssm.cc/
2. Place `nssm.exe` in this folder
3. **Run as Administrator**: `install_service.bat`
4. Server runs as Windows service (starts automatically)

### **Solution C: Task Scheduler**
1. Open **Task Scheduler** (Win + R, type `taskschd.msc`)
2. Create **Basic Task**
3. Set trigger: **At startup**
4. Set action: **Start a program**
5. Program: `python.exe`
6. Arguments: `app.py`
7. Start in: `[Your Project Folder Path]`

## **📱 Server Endpoints:**
- **Main Server**: http://127.0.0.1:8000
- **Health Check**: http://127.0.0.1:8000/health
- **SOS Dashboard**: http://127.0.0.1:8000/sos-dashboard
- **API Docs**: http://127.0.0.1:8000/docs

## **⚠️ Troubleshooting:**

### **Port Already in Use:**
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process
taskkill /PID [PROCESS_ID] /F
```

### **Python Not Found:**
- Install Python from: https://python.org
- Add Python to PATH during installation

### **Dependencies Missing:**
```bash
pip install -r requirements.txt
```

## **🔧 Maintenance:**
- **Update Server**: Replace `app.py` with new version
- **Restart Service**: `net stop DisasterManagementServer` then `net start DisasterManagementServer`
- **View Logs**: Check the terminal window for server logs

## **💡 Pro Tips:**
1. **Always use the same port** (8000) to avoid frontend configuration changes
2. **Keep the server running** while developing/testing
3. **Use Windows Service** for production environments
4. **Check server logs** if something isn't working

---
**Need Help?** Check the server logs in the terminal window for error messages.
