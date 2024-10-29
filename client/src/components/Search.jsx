import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { GlobalState } from '@/GlobalState';
import { Search as SearchIcon, ArrowDown } from '@icons';

const QUERY_TYPE_LIST = [
	{
		label: 'post',
		content: "Obras"
	},
	{
		label: 'artist',
		content: "Artistas"
	}
];

const SearchType = ({ controllers }) => {
	const [ type, setType ] = controllers;
	const [ openType, setOpenType ] = useState(false);

	const typeHandler = value => {
		setOpenType(!openType);
		if (type !== value) setType(value);
	};

	const handleOpen = e => {
		e.stopPropagation();
		setOpenType(!openType);
		document.removeEventListener('click', handleClick, false);
		document.removeEventListener('keydown', handleKeyDown, false);
	};

	const handleClick = e => {
		setOpenType(false);
		e.stopImmediatePropagation();
		document.removeEventListener('click', handleClick, false);
		document.removeEventListener('keydown', handleKeyDown, false);
	};

	const handleKeyDown = e => {
		const { key } = e;
		if (key === "Escape") {
			setOpenType(false);
			document.removeEventListener('click', handleClick, false);
			document.removeEventListener('keydown', handleKeyDown, false);
		};
	};

	useEffect(() => {
		if (openType) {
			document.addEventListener('click', handleClick, false);
			document.addEventListener('keydown', handleKeyDown, false);
		};
	}, [ openType ]);

	return (
		<button 
			onClick={ handleOpen }
			className='relative py-2 min-w-32 h-full outline-none bg-transparent'
		>

			<span className={ `flex items-center justify-between px-4 w-full h-full text-primary dark:text-bunker-400 gap-2` }>

				{ QUERY_TYPE_LIST.find(elem => elem.label === type).content }

				<ArrowDown className={ `w-6 transition-transform duration-100 ${ openType ? 'rotate-180' : '' }` } />

			</span>

			<ul className={ `${ openType ? 'flex' : 'hidden' } flex-col absolute top-[110%] left-0 w-full rounded-lg bg-white dark:bg-bunker-900 overflow-hidden shadow-md z-10` }>
				{
					QUERY_TYPE_LIST.map(({ label, content }) =>
						<span
							key={ label }
							className={ `px-4 py-2 w-full text-primary dark:text-bunker-100 text-left cursor-pointer transition-colors duration-100 ${ label === type ? 'bg-link-water-100 dark:bg-bunker-700 !cursor-default' : 'hover:bg-link-water-50 dark:hover:bg-bunker-800' }` }
							onClick={ () => typeHandler(label) }
						>
							{ content }
						</span>
					)
				}
			</ul>
		</button>
	)
};

const Search = ({ className = '', id = 'search', ...props }) => {
	const location = useLocation();
	const state = useContext(GlobalState);
	const { search: [ search, setSearch ] } = state;
	const [ value, setValue ] = useState('');
	const [ type, setType ] = useState(search.type);
	
	const handleInput = e => {
		const { value } = e.target;
		setValue(value);
	};

	const handleSearch = (search, type) => {
		setSearch({ search, type });
	};

	useEffect(() => {
		setValue('');
	}, [ location ]);

	useEffect(() => {
		if (!value) return setSearch({ search: '' });

		const delay = setTimeout(() => handleSearch(value, type), 500);

		return () => clearTimeout(delay);
	}, [ value, type ]);

	return (
		<div
			{ ...props }
			className={ `flex items-center relative min-w-[28rem] border-2 border-link-water-200 dark:border-bunker-800 rounded-lg bg-link-water-100 dark:bg-transparent transition-colors duration-100 focus-within:border-accent-500 [&>svg]:absolute [&>svg]:left-4 [&>svg]:w-6 [&>svg]:text-secondary [&>svg]:dark:text-bunker-800 [&>svg]:pointer-events-none ${ value?.length ? 'bg-transparent' : '' } ${ className }` }
		>

			<SearchIcon className='stroke-2' />

			<input
				className='py-2 pl-14 pr-4 w-full outline-none text-primary dark:text-mercury-100 font-medium bg-transparent placeholder:text-bunker-800 [&:not(:placeholder-shown)]:bg-transparent'
				type='search'
				inputMode='search'
				name='search'
				id={ id }
				placeholder='Buscar'
				autoComplete='off'
				value={ value }
				onChange={ handleInput }
			/>

			<SearchType controllers={[ type, setType ]} />

		</div>
	);
};

export default Search;