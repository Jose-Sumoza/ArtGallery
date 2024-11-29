import { useEffect, useContext } from 'react';
import { createBrowserRouter, Outlet, RouterProvider, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import { DataProvider, GlobalState } from '@/GlobalState';
import Footer from '@components/Footer';
import Header from '@components/Header';
import Modal from '@components/Modal';
import Protected from '@components/Protected';
import { ArtistDetail, Home, NewPost, PostDetail, ProfileEdit, Search, SignIn, SignUp } from '@pages';

const ScrollToTop = ({ children }) => {
	const state = useContext(GlobalState);
	const { search: [ { search } ] } = state;
	const location = useLocation();
	
	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: "instant"
		});
	}, [ location, search ]);

	return (
		<>
			{ children }
		</>
	);
};

const CustomOutlet = () => {
	const state = useContext(GlobalState);
	const {
		modal: [ modal, setModal ],
		postsAPI,
		artistsAPI,
		search,
		loading
	} = state;

	return (
		<>

			{
				search[0].search.trim() ?
					<Search state={{ postsAPI, artistsAPI, search, loading }} />
				:
					<Outlet />
			}

			{
				modal?.children ?
					<Modal
						setModal={ setModal }
						{ ...modal.props }
					>
						{ modal.children }
					</Modal>
				:
					null
			}

		</>
	);
};

const AppLayout = () => {
	const location = useLocation();
	const { pathname } = location;

	return (
		<DataProvider>
			<ScrollToTop>

				<Toaster
					position='bottom-right'
					toastOptions={{
						className: '!text-primary !dark:text-mercury-100 !bg-white !dark:bg-bunker-900'
					}}
				/>

				<Header />

				<div
					className={ `flex flex-1 text-primary dark:text-mercury-100 mx-auto w-full min-h-screen ${ pathname.split('/')[1] === 'posts' ? 'max-w-[75rem]' : 'max-w-[66rem]' } px-4 pt-8 lg:px-10` }
				>
					<CustomOutlet key={ pathname } />
				</div>

				<Footer />

				<Tooltip
					key={ location.key }
					id="my-tooltip"
					delayShow={ 500 }
					opacity={ 1 }
				/>

			</ScrollToTop>
		</DataProvider>
	);
};

const router = createBrowserRouter([
	{
		element: (<AppLayout />),
		children: [
			{
				path: '/',
				element: <Home />
			},
			{
				path: '/login',
				element: <Protected to="/" auth={ false }> <SignIn /> </Protected>
			},
			{
				path: '/register',
				element: <Protected to="/" auth={ false }> <SignUp /> </Protected>
			},
			{
				path: '/new',
				element: <Protected to="/login" auth={ true } role={ 1 }> <NewPost /> </Protected>
			},
			{
				path: '/edit/:id',
				element: <Protected to="/login" auth={ true } role={ 1 }> <NewPost /> </Protected>
			},
			{
				path: '/posts/:id',
				element: <PostDetail />
			},
			{
				path: '/artists/:id',
				element: <ArtistDetail />
			},
			{
				path: '/profile/:setting',
				element: <Protected to='/login' auth={ true }> <ProfileEdit /> </Protected>
			}
		]
	}
]);

function App() {
	return <RouterProvider router={ router } />;
};

export default App;