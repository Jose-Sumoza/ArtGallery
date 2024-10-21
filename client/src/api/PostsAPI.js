import { useState } from 'react';
import axios from 'axios';

export function PostsAPI(token) {
	const [ posts, setPosts ] = useState(null);

	const getById = async id => {
		try {
			const { data } = await axios.get(`/api/posts/${id}`);

			return data;
		} catch (err) {
			return err.response.data.content;
		};
	};

	const getPosts = async ({
		page = 1,
		search = '',
		sort = 'desc',
		limit = 20
	} = { page, search, sort, limit }) => {
		try {
			const { data } = await axios.get(
				`/api/posts?page=${ page }&search=${ search.trim() }&sort=${ sort }&limit=${ limit }`
			);

			return data;
		} catch (err) {
			return err.response.data.content;
		};
	};

	const createPost = async postData => {
		try {
			const { data } = await axios.post('/api/posts', postData, {
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

	const delPosts = async id => {
		try {
			const { data } = await axios.delete(`/api/posts/${ id }`, {
				headers: { Authorization: token }
			});

			return data;
		} catch (err) {
			console.log(err);
		};
	};

	const editPost = async (id, postData) => {
		try {
			const { data } = await axios.patch(`/api/posts/${ id }`, postData, {
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

	const ratePost = async (id, status) => {
		try {
			const { data } = await axios.patch(`/api/posts/${ id }/ratings`, status, {
				headers: { Authorization: token }
			});

			return data;
		} catch (err) {
			console.log(err);
			return err;
		};
	};

	return {
		posts: [ posts, setPosts, getPosts ],
		getById,
		delPosts,
		createPost,
		ratePost,
		editPost
	};
};