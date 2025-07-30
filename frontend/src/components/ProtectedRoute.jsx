import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
	const user = JSON.parse(localStorage.getItem('user'));

	if (!user) {
		// If no user is found in local storage, redirect to the login page
		return <Navigate to="/login" />;
	}

	return children;
};

export default ProtectedRoute;
