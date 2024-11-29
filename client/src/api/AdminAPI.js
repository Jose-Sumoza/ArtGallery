import axios from 'axios';

export function AdminAPI(token) {

	const getReport = async () => {
		try {
			const { data } = await axios.get('/api/report', {
				headers: {
					Authorization: token
				}
			});

			return data;
		} catch (err) {
			return err.message;
		};
	};

	const deleteUser = async id => {
		try {
			const { data } = await axios.delete(`/api/user/${ id }`, {
				headers: {
					Authorization: token
				}
			});

			return data;
		} catch (err) {
			return err.response.data.content;
		};
	};

	const setFeatured = async id => {
		try {
			const { data } = await axios.get(`/api/posts/${ id }/featured`, {
				headers: { Authorization: token }
			});

			return data;
		} catch (err) {
			return err.response.data.content;
		};
	};

	return {
		getReport,
		deleteUser,
		setFeatured
	};
};