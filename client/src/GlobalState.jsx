import React, { createContext, useState, useEffect, useReducer } from 'react';
import axios from 'axios';
import { PostsAPI, UserAPI, ArtistsAPI } from '@apis';
import useTheme from '@hooks/useTheme';

const reducer = (current, update) => ({...current, ...update});

export const GlobalState = createContext();

export const DataProvider = ({ children }) => {
	const { isDark, toggleTheme } = useTheme();
	const [ modal, setModal ] = useState(null);
	const [ token, setToken ] = useState(false);
	const [ logged, setLogged ] = useState(false);
	const [ search, setSearch ] = useReducer(reducer, {
		search: '',
		type: 'post'
	});
	const [ loading, setLoading ] = useState(true);
	const [ loadingModal, setLoadingModal ] = useState(false);

	const refreshToken = async () => {
		try {
			const res = await axios.get('/user/e229146b1984cd62e322005c53468c');
			const { data: { content: accessToken, success } } = res;

			if (success) setToken(accessToken);
		} catch (err) {
			const { response: { data: { content: msg } } } = err;
			console.log(msg);
			setLoading(false);
		};
	};

	useEffect(() => {
		const tryLogin = () => {
			const firstLogin = localStorage.getItem('firstLogin');
			if (firstLogin) return refreshToken();
			setLoading(false);
		};

		tryLogin();
	}, [ logged ]);

	const state = {
		postsAPI: PostsAPI(token),
		userAPI: UserAPI(token, setLoading, setLogged),
		artistsAPI: ArtistsAPI(),
		setLogged,
		loading: [ loading, setLoading ],
		loadingModal: [ loadingModal, setLoadingModal ],
		modal: [ modal, setModal ],
		search: [ search, setSearch ],
		token,
		useTheme: { isDark, toggleTheme }
	};

	return (
		<GlobalState.Provider value={ state }>
			{ children }
		</GlobalState.Provider>
	);
};