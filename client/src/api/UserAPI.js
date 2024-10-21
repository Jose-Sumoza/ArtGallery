import { useReducer, useEffect } from 'react';
import axios from 'axios';

const reducer = (current, update) => ({...current, ...update});

export function UserAPI(token, setLoading, setLogged) {
	const [ userState, setUserState ] = useReducer(reducer, {
		user: null,
		isLogged: false
	});

	const getUser = async token => {
		try {
			const { data } = await axios.get('/user/info', {
				headers: { Authorization: token }
			});
			const { success, content } = data;

			if (success) {
				setUserState({
					user: content,
					isLogged: true
				});

				setLogged(true);

				setLoading(false);
			};

			if (!success && content === 'El usuario no existe') {
				await axios.get('/user/logout', {
					headers: { Authorization: token }
				});
				localStorage.clear();
				window.location.href = '/';
			};
		} catch (err) {
			console.log(err);
		};
	};

	const updateUser = async userData => {
		try {
			const { data } = await axios.patch('/user/edit', userData, {
				headers: {
					Authorization: token,
					'Content-Type': 'multipart/form-data'
				}
			});
			
			return data;
		} catch (err) {
			console.log(err);
		};
	};

	const updateEmail = async userData => {
		try {
			const { data } = await axios.patch('/user/updateEmail', { ...userData }, {
				headers: { Authorization: token }
			});

			return data;
		} catch (err) {
			console.log(err);
		};
	};

	useEffect(() => {
		if (token) getUser(token);
	}, [ token ]);

	return {
		user: [ userState, setUserState ],
		updateUser,
		updateEmail
	};
};