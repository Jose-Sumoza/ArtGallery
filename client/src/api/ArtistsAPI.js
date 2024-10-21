import { useState } from 'react';
import axios from 'axios';

export function ArtistsAPI() {
	const [ artists, setArtists ] = useState(null);

	const getById = async ({
		id,
		page = 1,
		limit = 20
	} = { id, page, limit }) => {
		try {
			const { data } = await axios.get(`/api/artists/${id}?page=${ page }&limit=${ limit }`);

			return data;
		} catch (err) {
			return err.response.data.content;
		};
	};

	const getArtist = async ({
		page = 1,
		search = '',
		sort = 'desc',
		limit = 20
	} = { page, search, sort, limit }) => {
		try {
			const { data } = await axios.get(
				`/api/artists?page=${ page }&search=${ search.trim() }&sort=${ sort }&limit=${ limit }`
			);

			return data;
		} catch (err) {
			return err.response.data.content;
		};
	};

	return {
		artists: [ artists, setArtists, getArtist ],
		getById
	};
};