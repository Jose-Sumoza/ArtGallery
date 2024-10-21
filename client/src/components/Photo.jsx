/**
 * @param { React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> } param0 
 * @returns 
 */
const Photo = ({
	alt = "Foto de perfil",
	width = 128,
	height = 128,
	loading = 'eager',
	draggable= false,
	onContextMenu = e => e.preventDefault(),
	className = '',
	...props
}) => {
	return (
		<img
			alt={ alt }
			width={ width }
			height={ height }
			loading={ loading }
			draggable={ draggable }
			onContextMenu={ onContextMenu }
			className={ `rounded-full ${ className }` }
			{ ...props }
		/>
	);
};

export default Photo;