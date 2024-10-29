import { useRef, useState, useReducer, useContext, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GlobalState } from '@/GlobalState';
import Fieldset from '@components/Fieldset';
import Form from '@components/Form';
import Loading from '@components/Loading';
import Tags from '@components/Tags';
import POST from '@consts/post';
import { ArrowUp, Edit } from '@icons';

const INITIAL_DATA = {
	title: '',
	description: '',
	tags: [],
	images: null,
};

const reducer = (current, update) => ({...current, ...update});

export const NewPost = () => {
	const { pathname } = useLocation();
	
	const editMode = pathname.split('/')[1] === 'edit';

	const params = useParams();
	const state = useContext(GlobalState);
	const { postsAPI, useTheme } = state;
	const { createPost, editPost, getById } = postsAPI;
	const { isDark } = useTheme;
	const navigate = useNavigate();
	const [ loading, setLoading ] = useState(false);
	const [ postData, setPostData ] = useReducer(reducer, INITIAL_DATA);
	const [ previewURL, setPreviewURL ] = useState(null);
	const inputImagesRef = useRef(null);
	const inputTagsRef = useRef(null);
	const tagsRef = useRef(null);

	const onChange = e => {
		const { name, value } = e.target;

		setPostData({
			[ name ]: value
		});
	};

	const formValid = Object.entries(postData).every(([ key, value ]) => {
		if (key === 'tags') return value.length;
		if (editMode && previewURL && key === 'images') return true;
		return value;
	});

	const fileHandler = e => {
		e.preventDefault();

		const file = e.target.files[0];

		if (!file) {
			if (previewURL) {
				URL.revokeObjectURL(previewURL);
				setPreviewURL(null);
			};
			return setPostData({ images: null });
		};

		const dataTransfer = new DataTransfer();

		dataTransfer.items.add(file);

		inputImagesRef.current.files = dataTransfer.files;

		if (previewURL) URL.revokeObjectURL(previewURL);

		setPostData({ images: file });
		setPreviewURL(URL.createObjectURL(file));
	};

	const handleUpload = async e => {
	    if (loading) return e.preventDefault();
		
		e.preventDefault();

		if (!formValid) {
			const { title, description, tags, images } = postData;

			if (!title) return toast.error('El título es obligatorio.');
			if (!description) return toast.error('La descripción es obligatoria.');
			if (!tags.length) {
				inputTagsRef.current.scrollIntoView(true)
				return toast.error('Al menos 1 etiqueta es obligatoria.');
			};
			if (!images) return toast.error('La imagen es obligatoria.');
		};

        setLoading(true);

		try {
			const formData = new FormData();
	
			Object.entries(postData).forEach(([ key, value ]) => {
				if (key === 'tags') formData.append(key, JSON.stringify(value));
				formData.append(key, value);
			});
	
			const data = await createPost(formData);

			const { status, success, content } = data;

			if (status === 500) {
				toast.error("Error en el servidor.");
				return setLoading(false);
			};
	
			if (!success) {
				toast.error(content);
				return setLoading(false);
			};
			
			navigate(`/posts/${ content._id }`);
			setLoading(false);
			return toast.success('Publicación subida exitosamente.');
		} catch (err) {
			const { response: { data } } = err;
			const { success, content } = data;
			
			setLoading(false);
			if (!success) toast.error(content);
		};
	};

	const handleEdit = async e => {
	    if (loading) return e.preventDefault();
		
		e.preventDefault();

		if (!formValid) {
			const { title, description, tags, images } = postData;

			if (!title) return toast.error('El título es obligatorio.');
			if (!description) return toast.error('La descripción es obligatoria.');
			if (!tags.length) {
				inputTagsRef.current.scrollIntoView(true)
				return toast.error('Al menos 1 etiqueta es obligatoria.');
			};
			if (!images && !previewURL) return toast.error('La imagen es obligatoria.');
		};

        setLoading(true);

		try {
			const formData = new FormData();
	
			Object.entries(postData).forEach(([ key, value ]) => {
				if (key === 'tags') formData.append(key, JSON.stringify(value));
				if (editMode && key === 'images' && !value && previewURL) return;
				formData.append(key, value);
			});
	
			const data = await editPost(params.id, formData);

			const { status, success, content } = data;

			if (status === 500) {
				toast.error("Error en el servidor.");
				return setLoading(false);
			};
	
			if (!success) {
				toast.error(content);
				return setLoading(false);
			};
			
			navigate(`/posts/${ params.id }`);
			setLoading(false);
			return toast.success('Publicación actualizada exitosamente.');
		} catch (err) {
			const { response: { data } } = err;
			const { success, content } = data;
			
			setLoading(false);
			if (!success) toast.error(content);
		};
	};

	const fetchPost = async () => {
		const { status, success, content } = await getById(params.id);

		if (status === 500) {
			toast.error("Error en el servidor.");
			return navigate('/');
		};

		if (!success) {
			toast.error(content);
			return navigate(`/posts/${ params.id }`);
		};

		const { title, description, tags, images: [ { url } ] } = content;

		setPostData({
			title,
			description,
			tags
		});
		setPreviewURL(url);
	};

	useEffect(() => {
		if (editMode && !postData.title && params.id) fetchPost();
		if (editMode && postData.tags && tagsRef.current && !tagsRef.current.classList.contains('edit')) {
			const tagsList = [ ...tagsRef.current.querySelectorAll('li') ].filter(t => postData.tags.includes(t.textContent));

			tagsList.forEach(tag => tag.classList.add('active'));

			tagsRef.current.classList.add('edit');
		};
	}, [ postData.tags ]);


	if (editMode && !postData.title) return (
		<div className='flex items-center justify-center w-full'>
			<Loading size="150" color={ isDark ? 'var(--purple)' : 'var(--color-primary)' } stroke="5" />
		</div>
	);

	return (
		<main className='w-full'>
			
			<Form onSubmit={ editMode ? handleEdit : handleUpload } className='group flex flex-col items-center w-full h-full gap-8' data-invalid={ !formValid }>

				<Fieldset
					title={ editMode ? "Modo Edición" : "Nueva Obra de Arte" }
					subtitle={ editMode ? "¡Has todos los cambios que desees y actualiza tu publicación!" : "Comparte tu arte con el mundo. Es fácil y gratis." }
					classNames={{
						base: '!justify-start h-full',
						subtitle: 'text-center',
						content: 'lg:!flex-row justify-between flex-[1_1_0] lg:mt-6 h-full !gap-6'
					}}
				>

					<div className='flex flex-col w-full h-full'>

						<Fieldset.Field className='lg:sticky lg:top-[calc(var(--header-height)_+_.2rem)] h-fit gap-2'>
	
							<Fieldset.Field.Label
								htmlFor='images'
								className='font-medium after:content-["_*"] after:text-accent-500'
							>
								Obra de arte
							</Fieldset.Field.Label>
	
							<Fieldset.Field.Container 
								className={ `flex items-center justify-center relative p-8 !h-[25rem] border border-link-water-300 dark:border-bunker-800 rounded dark:bg-bunker-600/10 transition-colors duration-100 overflow-hidden ${ !previewURL ? ' hover:border-accent-500' : '' }` }
								data-tooltip-content={ previewURL ? '' : "Escoge una imagen" }
								data-tooltip-place='left'
								data-tooltip-id='my-tooltip'
							>

								{
									previewURL ?
										<>
											{
												!loading ?
													<div
														data-tooltip-content="Reemplazar imagen"
														data-tooltip-place='bottom'
														data-tooltip-id='my-tooltip'
														className='!absolute top-3 left-3 p-1 text-bunker-700 dark:text-mercury-100 bg-white dark:bg-bunker-900/50 rounded-full shadow-md cursor-pointer hover:text-accent-500'
														onClick={ () => inputImagesRef.current.click() }
													>
														<Edit className='!w-4' />
													</div>
												:
													null
											}

											<figure className='h-full'>
												<img
													src={ previewURL }
													alt='preview'
													draggable={ false }
													onContextMenu={ e => e.preventDefault() }
													className='h-full object-contain'
												/>
											</figure>

										</>
									:
										<div className='flex flex-col items-center gap-2'>
											<div
												onClick={ () => inputImagesRef.current.click() }
												className={ `flex items-center justify-center px-4 py-2 w-fit border border-link-water-300 dark:border-bunker-800 rounded bg-link-water-50 dark:bg-bunker-950 hover:bg-link-water-300 hover:dark:bg-bunker-950/40 hover:border-link-water-400 hover:dark:border-bunker-700 transition-[filter,color,background-color,border-color] duration-100 overflow-hidden gap-2 z-10 cursor-pointer ${ loading ? 'cursor-not-allowed opacity-80 hover:!bg-link-water-50 hover:!border-link-water-300' : '' }` }
											>
				
												<ArrowUp className='w-4 h-4 text-accent-500' />
				
												<span className='text-sm text-primary dark:text-mercury-100 font-semibold'>Sube tu obra de arte</span>
				
											</div>
											<span className='text-xs font-medium tracking-wider uppercase text-secondary dark:text-bunker-600'>jpg, jpeg, png, webp</span>
										</div>
								}
				
								<Fieldset.Field.Container.Input
									type='file'
									name='images'
									id='images'
									accept='.jpg, .jpeg, .png, .webp'
									onChange={ fileHandler }
									disabled={ loading }
									required={ !previewURL && !postData.images }
									className={ `!w-auto absolute top-0 right-0 h-full opacity-0 text-9xl cursor-default ${ postData.images || previewURL ? 'pointer-events-none' : '' }` }
									ref={ inputImagesRef }
									title=''
								/>
	
							</Fieldset.Field.Container>
							
						</Fieldset.Field>

					</div>

					<div className='flex flex-col items-end w-full h-full gap-6'>

						<Fieldset.Field className='gap-2'>
	
							<Fieldset.Field.Label
								htmlFor='title'
								className='font-medium after:content-["_*"] after:text-accent-500'
							>
								Título
							</Fieldset.Field.Label>
	
							<Fieldset.Field.Container className='flex flex-col !items-start gap-1'>
	
								<Fieldset.Field.Container.Input
									placeholder='¿Como se llama tu obra de arte?'
									type='text'
									name="title"
									id="title"
									value={ postData.title }
									onChange={ onChange }
									maxLength={ 50 }
									required
									disabled={ loading }
									className='!px-4 !py-2 !rounded dark:text-mercury-100 bg-link-water-100 dark:bg-bunker-900/30 border border-link-water-200 dark:border-bunker-800 transition-colors duration-100 select-none focus:border-link-water-400 dark:focus:border-bunker-600 disabled:opacity-80 disabled:cursor-not-allowed placeholder:dark:text-bunker-800'
								/>
	
							</Fieldset.Field.Container>
	
						</Fieldset.Field>

						<Fieldset.Field className='gap-2'>

							<Fieldset.Field.Label
								htmlFor='description'
								className='font-medium after:content-["_*"] after:text-accent-500'
							>
								Descripción
							</Fieldset.Field.Label>

							<Fieldset.Field.Container className='flex flex-col !items-start gap-1'>

								<Fieldset.Field.Container.TextArea
									name='description'
									id='description'
									placeholder='Descripción de la obra de arte'
									value={ postData.description }
									onChange={ onChange }
									required
									maxLength={ 5000 }
									disabled={ loading }
									className='!px-4 !py-2 resize-none [field-sizing:content] max-h-[374px] !rounded dark:text-mercury-100 bg-link-water-100 dark:bg-bunker-900/30 border border-link-water-200 dark:border-bunker-800 transition-colors duration-100 select-none focus:border-link-water-400 dark:focus:border-bunker-600 disabled:opacity-80 disabled:cursor-not-allowed placeholder:dark:text-bunker-800'
								/>

							</Fieldset.Field.Container>

						</Fieldset.Field>

						<Fieldset.Field className='gap-2'>

							<div 
								className='flex justify-between w-full scroll-mt-[calc(var(--header-height)_+_.15rem)]'
								ref={ inputTagsRef }
							>
								<Fieldset.Field.Label
									className='font-medium after:content-["_*"] after:text-accent-500'
								>
									Etiquetas
								</Fieldset.Field.Label>

								<span
									className={ `select-none font-mono transition-colors duration-100 ${ !postData.tags?.length ? 'text-red-500': '' }` }
									data-tooltip-content={ `Etiquetas seleccionadas: ${ postData.tags?.length || 0 }` }
									data-tooltip-place='left'
									data-tooltip-id='my-tooltip'
								>
									{ postData.tags?.length || 0 }/10
								</span>
							</div>

							<Fieldset.Field.Container className='flex flex-col !items-start gap-1'>

									<Tags
										className={ `flex flex-wrap w-full gap-2 [&_li]:cursor-pointer [&_li.active]:bg-accent-500 [&_li.active]:text-mercury-100 [&_li.active]:border-transparent ${ postData.tags.length === 10 || loading ? '[&_li:not(.active)]:border-link-water-400 [&_li:not(.active)]:dark:border-bunker-800 [&_li:not(.active)]:bg-gray-400 [&_li:not(.active)]:dark:bg-bunker-900 [&_li:not(.active)]:opacity-50 [&_li:not(.active)]:dark:opacity-30 [&_li:not(.active)]:cursor-not-allowed' : '' }` }
										tags={ POST.tags.sort((a, b) => a.localeCompare(b, 'es')) }
										ref={ tagsRef }
										onClick={ e => {
											if (loading) return toast.error('No puedes seleccionar etiquetas en este momento');
											const { target } = e;

											if (target.tagName !== 'LI') return e.preventDefault();

											const { textContent } = target;

											if (!POST.tags.includes(textContent)) return toast.error('Acción inválida');

											if (postData.tags.includes(textContent)) {
												setPostData({
													tags: [ ...postData.tags.filter(t => t !== textContent) ]
												});
												return target.classList.remove('active')
											};

											if (postData.tags.length === 10) return toast.error('Limite de etiquetas alcanzado.');
												
											setPostData({
												tags: [ ...postData.tags, textContent ]
											});
											target.classList.add('active')
										}}
									/>

							</Fieldset.Field.Container>

						</Fieldset.Field>

						<button
							type='submit'
							className={ `flex items-center justify-center px-4 py-2 w-fit rounded gradient bg-accent-500 gap-2 transition-[filter,color,background-color,background-image] duration-100 group-invalid:cursor-not-allowed group-invalid:bg-none group-invalid:opacity-50 group-data-[invalid=true]:cursor-not-allowed group-data-[invalid=true]:bg-none group-data-[invalid=true]:opacity-50 ${ loading ? 'cursor-not-allowed opacity-80 hover:brightness-100' : 'group-data-[invalid=false]:group-valid:hover:brightness-110' }` }
						>

							{
								loading ?
									<Loading size="16" stroke="1.5" color='var(--bg-color)' />
								:
									<ArrowUp className='w-4 h-4 text-mercury-100' /> 
							}

							<span className='text-sm font-semibold text-mercury-100'>{ editMode ? "Actualizar" : "Publicar" }</span>

						</button>

					</div>

				</Fieldset>

			</Form>
		</main>
	);
};