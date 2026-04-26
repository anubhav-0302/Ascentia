import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

// Test document upload
async function testDocumentUpload() {
  try {
    // First login to get token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@ascentia.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.error('Login failed:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login successful');

    // Check if employee ID 1 exists
    const employeesResponse = await fetch('http://localhost:5000/api/employees', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const employeesData = await employeesResponse.json();
    const employee1 = employeesData.data.find(e => e.id === 1);
    
    if (!employee1) {
      console.error('❌ Employee ID 1 not found');
      console.log('Available employees:', employeesData.data.map(e => ({ id: e.id, name: e.name })));
      return;
    }
    
    console.log('✅ Employee ID 1 exists:', employee1.name);

    // Create test file if it doesn't exist
    const testFilePath = './test-document.txt';
    if (!fs.existsSync(testFilePath)) {
      fs.writeFileSync(testFilePath, 'This is a test document for upload functionality testing.');
    }

    // Create form data
    const form = new FormData();
    form.append('employeeId', '1');
    form.append('document', fs.createReadStream(testFilePath), {
      filename: 'test-document.txt',
      contentType: 'text/plain'
    });

    // Upload document
    const uploadResponse = await fetch('http://localhost:5000/api/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });

    const uploadData = await uploadResponse.json();
    
    if (uploadData.success) {
      console.log('✅ Document upload successful!');
      console.log('Document ID:', uploadData.data.id);
      console.log('File URL:', uploadData.data.fileUrl);
      
      // Test download
      const downloadResponse = await fetch(`http://localhost:5000/api/documents/${uploadData.data.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (downloadResponse.ok) {
        console.log('✅ Document download successful!');
      } else {
        console.log('❌ Document download failed:', downloadResponse.status);
      }
    } else {
      console.error('❌ Document upload failed:', uploadData.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDocumentUpload();
