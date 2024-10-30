import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { GlobalState } from "@/GlobalState";
import Loading from '@components/Loading';

const Protected = ({ to, auth, role, children }) => {
	const state = useContext(GlobalState);
	const location = useLocation();
	const { loading: loadingTools, userAPI, useTheme } = state;
	const [ loading ] = loadingTools;
	const { isDark } = useTheme;
	const { user: [ { user, isLogged } ] } = userAPI;
	const protectedPath = location.pathname === to;

	if (loading) return <div className='flex items-center justify-center w-full'><Loading size="100" color={ isDark ? 'var(--purple)' : 'var(--color-primary)' } stroke="5" /></div>;
	if (!auth && isLogged) return <Navigate to={ to } replace/>;
	if (!isLogged && auth && !protectedPath) return <Navigate to={ to } replace/>;
	if (role && role !== user.role) return <Navigate to={ to } replace/>;
	
	return children;
};

export default Protected;