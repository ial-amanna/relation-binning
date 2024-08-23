import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import CsvUploader from './components/CsvUploader';
import BinPlot from './components/BinPlot';
import ScatterPlot from './components/ScatterPlot';



function App() {
  const [data, setData] = useState([]);

  return (
    <div className="App h-full">
      <div className="p-5 bg-slate-200">
        <h1 className="text-slate-900 text-2xl text-left">Relation Discovery Binning Project</h1>
      </div>
      <div className="flex h-screen">
        <div className="w-1/5 p-5 h-full border-slate-200 text-left">      
          <CsvUploader setData={setData}/>
          {data.length===0 && (
          <p className='m-2'>No data uploaded yet.</p>
          )}
          {console.log(data)}
        </div>
        <div className="w-4/5 p-5 h-full border-l-2 border-slate-200 bg-white">
          <h1 className="text-slate-900 text-2xl text-left">Core interface</h1>
          {data.length > 0 && (
            <>
              <h2 className="text-slate-900 text-xl text-left mt-4">Bin Plot</h2>
              <BinPlot data={data} />
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
