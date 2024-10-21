import { useEffect, useRef, useContext } from 'react';
import { GlobalState } from '@/GlobalState';
import { Cancel } from '@icons';

/**
 * @typedef { object } ModalOptions
 * @property { boolean } [ hasCloseBtn = true ]
 * @property { () => void } [ onClose ]
 * @property { React.ReactNode } children
 */

/**
 * @param { ModalOptions } options 
 * @returns 
 */
const Modal = ({
	setModal,
	hasCloseBtn = true,
	onClose,
	children
}) => {
	const state = useContext(GlobalState);
	const { loadingModal: [ loading ] } = state;
	const modalRef = useRef(null);
	
	const handleCloseModal = () => {
		if (loading) return;
		if (onClose) onClose();
		setModal(null);
	};

	const handleKeyDown = e => {
		if (loading) return;
		const { key } = e;
		if (key === "Escape") handleCloseModal();
	};

	useEffect(() => {
		if (modalRef && modalRef.current) modalRef.current.focus();
	}, [ modalRef ]);

	return (
		<div
			className = 'flex items-center justify-center fixed inset-0 outline-none bg-black/30 backdrop-blur z-[9999]'
			onClick = { handleCloseModal }
			onKeyDown = { handleKeyDown }
			tabIndex={ 0 }
			ref = { modalRef }
			role='dialog'
		>
			<div 
				className='relative'
				onClick = { e => e.stopPropagation() }
			>
				{
					hasCloseBtn ?
						<button
							className={ `flex items-center justify-center absolute top-4 right-4 p-2 border-none outline-none text-primary bg-transparent transition-colors duration-100 z-[1] [&_svg]:w-4 ${ loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:text-red-500' }` }
							onClick={ handleCloseModal }
							disabled={ loading }
						>
							<Cancel />
						</button>
					:
						null
				}

				{ children }
			</div>
		</div>
	);
};

export default Modal;