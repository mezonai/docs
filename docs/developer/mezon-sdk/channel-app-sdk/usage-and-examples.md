---
sidebar_position: 4
---

# Usage and Examples

This guide provides practical examples and usage patterns for building Mezon channel apps with URL-based authentication.

## Basic Authentication Pattern

### Simple Authentication Setup

```javascript
// auth.js - Simple authentication module

class MezonAuth {
  constructor(apiEndpoint = '/api/auth/mezon-hash') {
    this.apiEndpoint = apiEndpoint;
    this.token = null;
    this.user = null;
  }

  // Extract auth data from URL
  getAuthDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const authData = urlParams.get('data');
    
    if (!authData) {
      return null;
    }
    
    try {
      return decodeURIComponent(authData);
    } catch (error) {
      console.error('Error decoding auth data:', error);
      return null;
    }
  }

  // Authenticate with backend
  async authenticate(rawHashData) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hashData: btoa(rawHashData)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        this.token = result.token;
        this.user = result.user;
        this.storeAuth();
        return result;
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (error) {
      throw new Error(`Authentication error: ${error.message}`);
    }
  }

  // Store authentication data
  storeAuth() {
    if (this.token) {
      localStorage.setItem('auth_token', this.token);
    }
    if (this.user) {
      sessionStorage.setItem('user_data', JSON.stringify(this.user));
    }
  }

  // Check if authenticated
  isAuthenticated() {
    const token = localStorage.getItem('auth_token');
    return token && !this.isTokenExpired(token);
  }

  // Check token expiry
  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  // Get stored auth
  getStoredAuth() {
    const token = localStorage.getItem('auth_token');
    const userJson = sessionStorage.getItem('user_data');
    
    if (token && userJson) {
      return {
        token,
        user: JSON.parse(userJson)
      };
    }
    
    return null;
  }

  // Clean URL
  cleanURL() {
    const url = new URL(window.location.href);
    url.searchParams.delete('data');
    window.history.replaceState({}, document.title, url.toString());
  }

  // Initialize authentication
  async init() {
    // Check existing auth
    if (this.isAuthenticated()) {
      const stored = this.getStoredAuth();
      this.token = stored.token;
      this.user = stored.user;
      return { success: true, user: this.user };
    }

    // Get auth data from URL
    const authData = this.getAuthDataFromURL();
    if (!authData) {
      throw new Error('No authentication data found');
    }

    // Authenticate
    const result = await this.authenticate(authData);
    this.cleanURL();
    return result;
  }
}

// Usage
const auth = new MezonAuth();
auth.init()
  .then(result => {
    console.log('Authenticated:', result.user);
    initApp();
  })
  .catch(error => {
    console.error('Authentication failed:', error);
    showErrorMessage(error.message);
  });
```

## Complete Application Examples

### Example 1: Todo List Channel App

A simple todo list that persists tasks for authenticated users.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo List - Mezon Channel App</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
        }

        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }

        .header .user-info {
            opacity: 0.9;
            font-size: 14px;
        }

        .content {
            padding: 30px;
        }

        .status {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 8px;
            font-weight: 500;
        }

        .status.loading {
            background: #fff3cd;
            color: #856404;
        }

        .status.error {
            background: #f8d7da;
            color: #721c24;
        }

        .add-todo {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }

        .add-todo input {
            flex: 1;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 14px;
        }

        .add-todo input:focus {
            outline: none;
            border-color: #667eea;
        }

        .add-todo button {
            padding: 12px 24px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.2s;
        }

        .add-todo button:hover {
            background: #5568d3;
        }

        .todo-list {
            list-style: none;
        }

        .todo-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 6px;
            margin-bottom: 10px;
            transition: background 0.2s;
        }

        .todo-item:hover {
            background: #e9ecef;
        }

        .todo-item.completed {
            opacity: 0.6;
        }

        .todo-item input[type="checkbox"] {
            width: 20px;
            height: 20px;
            cursor: pointer;
        }

        .todo-item span {
            flex: 1;
            font-size: 16px;
        }

        .todo-item.completed span {
            text-decoration: line-through;
        }

        .todo-item button {
            padding: 6px 12px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }

        .empty-state {
            text-align: center;
            padding: 40px;
            color: #6c757d;
        }

        .empty-state svg {
            width: 64px;
            height: 64px;
            margin-bottom: 15px;
            opacity: 0.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ My Todo List</h1>
            <div class="user-info" id="user-info"></div>
        </div>
        
        <div class="content">
            <div id="status" class="status loading">⏳ Authenticating...</div>
            
            <div id="app" style="display: none;">
                <div class="add-todo">
                    <input type="text" id="todo-input" placeholder="What needs to be done?" />
                    <button onclick="addTodo()">Add</button>
                </div>
                
                <ul class="todo-list" id="todo-list"></ul>
                
                <div class="empty-state" id="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <p>No todos yet. Add one to get started!</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        let auth = null;
        let todos = [];

        // Authentication
        async function initAuth() {
            const urlParams = new URLSearchParams(window.location.search);
            const authData = urlParams.get('data');
            
            if (!authData) {
                showError('This app must be opened from Mezon');
                return false;
            }

            try {
                const decoded = decodeURIComponent(authData);
                const response = await fetch('/api/auth/mezon-hash', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hashData: btoa(decoded) })
                });

                const result = await response.json();
                
                if (result.success) {
                    auth = result;
                    localStorage.setItem('auth_token', result.token);
                    
                    // Clean URL
                    const url = new URL(window.location.href);
                    url.searchParams.delete('data');
                    window.history.replaceState({}, document.title, url.toString());
                    
                    return true;
                } else {
                    showError(result.error || 'Authentication failed');
                    return false;
                }
            } catch (error) {
                showError('Authentication error: ' + error.message);
                return false;
            }
        }

        function showError(message) {
            document.getElementById('status').className = 'status error';
            document.getElementById('status').textContent = '❌ ' + message;
        }

        // Todo management
        async function loadTodos() {
            try {
                const response = await fetch('/api/todos', {
                    headers: {
                        'Authorization': `Bearer ${auth.token}`
                    }
                });

                if (response.ok) {
                    todos = await response.json();
                    renderTodos();
                }
            } catch (error) {
                console.error('Error loading todos:', error);
            }
        }

        async function saveTodos() {
            try {
                await fetch('/api/todos', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${auth.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(todos)
                });
            } catch (error) {
                console.error('Error saving todos:', error);
            }
        }

        function addTodo() {
            const input = document.getElementById('todo-input');
            const text = input.value.trim();
            
            if (text) {
                todos.push({
                    id: Date.now(),
                    text: text,
                    completed: false
                });
                
                input.value = '';
                renderTodos();
                saveTodos();
            }
        }

        function toggleTodo(id) {
            const todo = todos.find(t => t.id === id);
            if (todo) {
                todo.completed = !todo.completed;
                renderTodos();
                saveTodos();
            }
        }

        function deleteTodo(id) {
            todos = todos.filter(t => t.id !== id);
            renderTodos();
            saveTodos();
        }

        function renderTodos() {
            const list = document.getElementById('todo-list');
            const emptyState = document.getElementById('empty-state');
            
            if (todos.length === 0) {
                list.style.display = 'none';
                emptyState.style.display = 'block';
            } else {
                list.style.display = 'block';
                emptyState.style.display = 'none';
                
                list.innerHTML = todos.map(todo => `
                    <li class="todo-item ${todo.completed ? 'completed' : ''}">
                        <input type="checkbox" 
                               ${todo.completed ? 'checked' : ''}
                               onchange="toggleTodo(${todo.id})">
                        <span>${escapeHtml(todo.text)}</span>
                        <button onclick="deleteTodo(${todo.id})">Delete</button>
                    </li>
                `).join('');
            }
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Initialize app
        async function initApp() {
            const authenticated = await initAuth();
            
            if (authenticated) {
                document.getElementById('status').style.display = 'none';
                document.getElementById('app').style.display = 'block';
                document.getElementById('user-info').textContent = 
                    `👤 ${auth.user.display_name || auth.user.username}`;
                
                await loadTodos();
                
                // Allow Enter key to add todo
                document.getElementById('todo-input').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        addTodo();
                    }
                });
            }
        }

        // Start the app
        window.addEventListener('DOMContentLoaded', initApp);
    </script>
</body>
</html>
```

### Example 2: User Profile Viewer

Display authenticated user information.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile Viewer</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        
        .profile-card {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: block;
            background: #667eea;
        }
        
        .info-row {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .info-row:last-child {
            border-bottom: none;
        }
        
        .label {
            font-weight: bold;
            color: #666;
        }
        
        .value {
            margin-top: 5px;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="profile-card">
        <img id="avatar" class="avatar" alt="User Avatar" />
        <h2 id="display-name" style="text-align: center;"></h2>
        
        <div class="info-row">
            <div class="label">User ID</div>
            <div class="value" id="user-id"></div>
        </div>
        
        <div class="info-row">
            <div class="label">Username</div>
            <div class="value" id="username"></div>
        </div>
        
        <div class="info-row">
            <div class="label">Mezon ID</div>
            <div class="value" id="mezon-id"></div>
        </div>
        
        <div class="info-row">
            <div class="label">Authenticated At</div>
            <div class="value" id="auth-date"></div>
        </div>
    </div>

    <script>
        async function init() {
            // Extract auth data
            const urlParams = new URLSearchParams(window.location.search);
            const authData = urlParams.get('data');
            
            if (!authData) {
                alert('No authentication data found');
                return;
            }

            try {
                // Authenticate
                const decoded = decodeURIComponent(authData);
                const response = await fetch('/api/auth/mezon-hash', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hashData: btoa(decoded) })
                });

                const result = await response.json();
                
                if (result.success) {
                    displayProfile(result.user);
                } else {
                    alert('Authentication failed: ' + result.error);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }

        function displayProfile(user) {
            document.getElementById('avatar').src = user.avatar_url || 'default-avatar.png';
            document.getElementById('display-name').textContent = user.display_name || user.username;
            document.getElementById('user-id').textContent = user.id;
            document.getElementById('username').textContent = user.username;
            document.getElementById('mezon-id').textContent = user.mezon_id || 'N/A';
            
            // Parse auth date from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const authData = urlParams.get('data');
            const decoded = decodeURIComponent(authData);
            const params = new URLSearchParams(decoded);
            const authDate = new Date(parseInt(params.get('auth_date')) * 1000);
            document.getElementById('auth-date').textContent = authDate.toLocaleString();
        }

        window.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>
```

### Example 3: API Integration Pattern

Authenticated API requests to your backend.

```javascript
// api-client.js

class MezonAPIClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  async request(endpoint, options = {}) {
    const url = this.baseURL + endpoint;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add authentication token
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, {
      method: 'GET'
    });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

// Usage
const api = new MezonAPIClient('/api');

// Get user data
api.get('/user/profile')
  .then(profile => console.log('Profile:', profile))
  .catch(error => console.error('Error:', error));

// Create resource
api.post('/items', { name: 'New Item', value: 123 })
  .then(item => console.log('Created:', item))
  .catch(error => console.error('Error:', error));

// Update resource
api.put('/items/1', { name: 'Updated Item' })
  .then(item => console.log('Updated:', item))
  .catch(error => console.error('Error:', error));

// Delete resource
api.delete('/items/1')
  .then(() => console.log('Deleted'))
  .catch(error => console.error('Error:', error));
```

## Backend Examples

### Node.js (Express) Backend

```javascript
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const APP_SECRET = process.env.MEZON_APP_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

// Validate Mezon hash
function validateMezonHash(hashData) {
  const params = new URLSearchParams(hashData);
  const receivedHash = params.get('hash');
  params.delete('hash');
  
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  
  const secretKey = crypto.createHash('md5').update(APP_SECRET).digest();
  const webAppKey = crypto.createHmac('sha256', secretKey).update('WebAppData').digest();
  const computedHash = crypto.createHmac('sha256', webAppKey).update(dataCheckString).digest('hex');
  
  return computedHash === receivedHash;
}

// Authentication endpoint
app.post('/api/auth/mezon-hash', (req, res) => {
  try {
    const { hashData } = req.body;
    const decoded = Buffer.from(hashData, 'base64').toString();
    
    if (!validateMezonHash(decoded)) {
      return res.status(401).json({ success: false, error: 'Invalid hash' });
    }
    
    const params = new URLSearchParams(decoded);
    const user = JSON.parse(params.get('user'));
    const authDate = parseInt(params.get('auth_date'));
    
    // Check if auth is too old (e.g., 1 hour)
    if (Date.now() / 1000 - authDate > 3600) {
      return res.status(401).json({ success: false, error: 'Authentication expired' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected route example
app.get('/api/user/profile', authenticateToken, (req, res) => {
  res.json({
    id: req.user.userId,
    username: req.user.username
  });
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Python (Flask) Backend

```python
import os
import hashlib
import hmac
import json
import jwt
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from urllib.parse import parse_qs
import base64

app = Flask(__name__)
APP_SECRET = os.getenv('MEZON_APP_SECRET')
JWT_SECRET = os.getenv('JWT_SECRET')

def validate_mezon_hash(hash_data):
    params = parse_qs(hash_data)
    received_hash = params.get('hash', [''])[0]
    
    # Remove hash from params
    del params['hash']
    
    # Sort parameters
    data_check_string = '\n'.join([
        f"{k}={v[0]}" for k, v in sorted(params.items())
    ])
    
    # Step 1: MD5 hash of secret
    secret_key = hashlib.md5(APP_SECRET.encode()).digest()
    
    # Step 2: HMAC-SHA256 with "WebAppData"
    web_app_key = hmac.new(secret_key, b'WebAppData', hashlib.sha256).digest()
    
    # Step 3: HMAC-SHA256 with data
    computed_hash = hmac.new(
        web_app_key,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return computed_hash == received_hash

@app.route('/api/auth/mezon-hash', methods=['POST'])
def authenticate():
    try:
        data = request.json
        hash_data_base64 = data.get('hashData')
        
        # Decode base64
        hash_data = base64.b64decode(hash_data_base64).decode()
        
        # Validate hash
        if not validate_mezon_hash(hash_data):
            return jsonify({'success': False, 'error': 'Invalid hash'}), 401
        
        # Parse parameters
        params = parse_qs(hash_data)
        user = json.loads(params.get('user', ['{}'])[0])
        auth_date = int(params.get('auth_date', ['0'])[0])
        
        # Check expiry
        if datetime.now().timestamp() - auth_date > 3600:
            return jsonify({'success': False, 'error': 'Expired'}), 401
        
        # Generate JWT
        token = jwt.encode(
            {
                'userId': user.get('id'),
                'username': user.get('username'),
                'exp': datetime.utcnow() + timedelta(hours=24)
            },
            JWT_SECRET,
            algorithm='HS256'
        )
        
        return jsonify({
            'success': True,
            'token': token,
            'user': user
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000)
```

### Go Backend

```go
package main

import (
	"crypto/hmac"
	"crypto/md5"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	appSecret = os.Getenv("MEZON_APP_SECRET")
	jwtSecret = []byte(os.Getenv("JWT_SECRET"))
)

type User struct {
	ID          int    `json:"id"`
	Username    string `json:"username"`
	DisplayName string `json:"display_name"`
	AvatarURL   string `json:"avatar_url"`
	MezonID     string `json:"mezon_id"`
}

type AuthRequest struct {
	HashData string `json:"hashData"`
}

type AuthResponse struct {
	Success bool   `json:"success"`
	Token   string `json:"token,omitempty"`
	User    *User  `json:"user,omitempty"`
	Error   string `json:"error,omitempty"`
}

func validateMezonHash(hashData string) bool {
	params, _ := url.ParseQuery(hashData)
	receivedHash := params.Get("hash")
	params.Del("hash")

	// Sort parameters
	keys := make([]string, 0, len(params))
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var dataCheckParts []string
	for _, k := range keys {
		dataCheckParts = append(dataCheckParts, fmt.Sprintf("%s=%s", k, params.Get(k)))
	}
	dataCheckString := strings.Join(dataCheckParts, "\n")

	// Step 1: MD5 hash
	md5Hash := md5.Sum([]byte(appSecret))

	// Step 2: HMAC-SHA256 with "WebAppData"
	webAppKey := hmac.New(sha256.New, md5Hash[:])
	webAppKey.Write([]byte("WebAppData"))

	// Step 3: HMAC-SHA256 with data
	finalHash := hmac.New(sha256.New, webAppKey.Sum(nil))
	finalHash.Write([]byte(dataCheckString))
	computedHash := hex.EncodeToString(finalHash.Sum(nil))

	return computedHash == receivedHash
}

func authenticateHandler(w http.ResponseWriter, r *http.Request) {
	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(AuthResponse{Success: false, Error: err.Error()})
		return
	}

	// Decode base64
	decoded, err := base64.StdEncoding.DecodeString(req.HashData)
	if err != nil {
		json.NewEncoder(w).Encode(AuthResponse{Success: false, Error: "Invalid base64"})
		return
	}

	hashData := string(decoded)

	// Validate hash
	if !validateMezonHash(hashData) {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(AuthResponse{Success: false, Error: "Invalid hash"})
		return
	}

	// Parse user
	params, _ := url.ParseQuery(hashData)
	var user User
	json.Unmarshal([]byte(params.Get("user")), &user)

	// Generate JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId":   user.ID,
		"username": user.Username,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenString, _ := token.SignedString(jwtSecret)

	json.NewEncoder(w).Encode(AuthResponse{
		Success: true,
		Token:   tokenString,
		User:    &user,
	})
}

func main() {
	http.HandleFunc("/api/auth/mezon-hash", authenticateHandler)
	http.ListenAndServe(":3000", nil)
}
```

## Advanced Patterns

### Token Refresh Pattern

```javascript
class AuthManager {
  constructor(apiEndpoint) {
    this.apiEndpoint = apiEndpoint;
    this.token = localStorage.getItem('auth_token');
    this.refreshTimer = null;
  }

  async authenticate(hashData) {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hashData: btoa(hashData) })
    });

    const result = await response.json();
    
    if (result.success) {
      this.setToken(result.token);
      this.scheduleRefresh();
    }
    
    return result;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  scheduleRefresh() {
    // Parse token to get expiry
    const payload = JSON.parse(atob(this.token.split('.')[1]));
    const expiresIn = payload.exp * 1000 - Date.now();
    const refreshIn = expiresIn - 5 * 60 * 1000; // Refresh 5 min before expiry

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, refreshIn);
  }

  async refreshToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        this.setToken(result.token);
        this.scheduleRefresh();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Handle refresh failure (e.g., redirect to login)
    }
  }
}
```

### Error Handling Pattern

```javascript
class ErrorHandler {
  static handle(error, context = '') {
    console.error(`[${context}]`, error);

    let message = 'An unexpected error occurred';
    
    if (error.message) {
      message = error.message;
    }

    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = 'Authentication failed. Please try again.';
          this.handleAuthError();
          break;
        case 403:
          message = 'You do not have permission to perform this action.';
          break;
        case 404:
          message = 'The requested resource was not found.';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
      }
    }

    this.showError(message);
  }

  static handleAuthError() {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_data');
    
    // Optionally reload or redirect
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  static showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 15px 20px;
      border-radius: 6px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 10000;
    `;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}

// Usage
try {
  await api.post('/data', payload);
} catch (error) {
  ErrorHandler.handle(error, 'DataSubmission');
}
```

## Testing Your Channel App

### Local Development Testing

```javascript
// test-harness.js
// Simulates Mezon authentication for local testing

class MezonTestHarness {
  static createMockAuthData(userId = 123456) {
    const user = {
      id: userId,
      username: 'test_user',
      display_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      mezon_id: 'test@mezon.local'
    };

    const authData = new URLSearchParams({
      query_id: 'TEST_' + Date.now(),
      user: JSON.stringify(user),
      auth_date: Math.floor(Date.now() / 1000).toString(),
      hash: 'test_hash_' + Math.random()
    }).toString();

    return encodeURIComponent(authData);
  }

  static injectAuthData(userId) {
    const authData = this.createMockAuthData(userId);
    const url = new URL(window.location.href);
    url.searchParams.set('data', authData);
    window.location.href = url.toString();
  }

  static isTestEnvironment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }
}

// Auto-inject test auth if in development
if (MezonTestHarness.isTestEnvironment() && !new URLSearchParams(window.location.search).has('data')) {
  MezonTestHarness.injectAuthData();
}
```

## Best Practices

### 1. Always Validate on Backend

```javascript
// ❌ BAD - Client-side only
if (hashData) {
  showApp();
}

// ✅ GOOD - Backend validation
const result = await authenticateWithBackend(hashData);
if (result.success) {
  showApp();
}
```

### 2. Clean Sensitive Data from URLs

```javascript
// ✅ Always clean URL after authentication
function cleanURL() {
  const url = new URL(window.location.href);
  url.searchParams.delete('data');
  window.history.replaceState({}, document.title, url.toString());
}
```

### 3. Handle Authentication Expiry

```javascript
// ✅ Check token validity
function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
```

### 4. Implement Proper Error Handling

```javascript
// ✅ Comprehensive error handling
async function authenticate(hashData) {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ hashData: btoa(hashData) })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Authentication failed: ' + error.message);
  }
}
```

### 5. Use HTTPS in Production

```javascript
// ✅ Enforce HTTPS
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

:::warning Security Reminder

Always implement backend validation. Never trust client-side authentication alone. Keep your App Secret secure and never expose it in client-side code.

:::
