import React, {useState} from 'react';
import Papa from 'papaparse';

const CsvUploader = ({setData}) => {

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function(result){
        const parsedData = result.data;
        setData(parsedData);


            // Send data to backend
      const response = await fetch('http://localhost:8000/upload-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData),
      });
      if (response.ok) {
        console.log('CSV data sent successfully');
      } else {
        console.error('Failed to send CSV data');
      }

      },
    });
  
    
  };

  return (
    <div>
      <div className='text-left'>
        <input id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
        />
        <label htmlFor="file-upload" className="bg-transparent hover:bg-blue-400 text-slate-900 font-semibold hover:text-white py-2 px-4 border border-slate-900 hover:border-transparent rounded">
          Upload File
        </label>
      </div>
    </div>
  );
};

export default CsvUploader;