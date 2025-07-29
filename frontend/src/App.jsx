// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios
import './App.css';

function App() {
	const [data, setData] = useState(null);

	useEffect(() => {
		// Use Axios to make a GET request to the backend API
		axios
			.get('/api/data')
			.then((response) => {
				setData(response.data.message);
			})
			.catch((error) => {
				console.error('There was an error fetching the data!', error);
			});
	}, []); // The empty dependency array ensures this effect runs once when the component mounts

	return (
		<div className="App">
			<header className="App-header text-3xl">
				{data ? <p>{data}</p> : <p>Loadin1g...</p>}
			</header>
		</div>
	);
}

export default App;
