import RichEditor from "./RichEditor";
import EditorAside from "./EditorAside";
import axiosInstance from "../../Helpers/axiosInstance";
import { useToast } from "@chakra-ui/react";
import { IoIosArrowForward } from "react-icons/io";
import Nav from "../../Layouts/Nav";
import "./editor.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";

export default function CreateNote() {
	const { id } = useParams();
	const toast = useToast();
	// State variables
	const [noteDetails, setNoteDetails] = useState({
		title: "",
		description: "",
		tags: [],
		category: "",
		visibility: "private",
		sharedWith: [],
	});
	const [content, setContent] = useState(
		"<h1>Hello I am a rich text editor!</h1>"
	);

	// Client Socket Connection
	const connectSocket = async () => {
		console.log("Connecting to socket");
		const socket = io("http://localhost:5000");
		socket.on("connect", () => {
			console.log("Connected to server");
		});

		// Listen to events (check eventname from backend)
		socket.on("updateNote", (data) => {
			console.log("Note Updated", data);
			setContent(data.note.content);
		});

		// Emit events
		socket.emit("editNote", { noteId: id });

		// Return the socket connection
		return socket;
	};

	const navigate = useNavigate();
	// Fetch note details
	const fetchNoteDetails = async () => {
		try {
			const res = await axiosInstance.get(`/notes/${id}`);

			const user =await JSON.parse(localStorage.getItem('user'));
			// console.log(user.userId);
			let flag=false
			const isSharedWith = ()=>{
				res.data.note.sharedWith.forEach((item)=>{
					const {id} = item;
					if(user.userId === id){
						flag=true;
					}
				})
			}
			isSharedWith();

			// console.log("Hello");
			if(user.userId === res.data.note.user.id || flag){
				console.log(res.data.note);
				setNoteDetails(res.data.note);
				setContent(res.data.note.content);
			}
			else{
				toast({
					title: "Not authorized to edit this note",
					description: "Please try again later",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
				navigate('/');
			}

		} catch (error) {
			console.error(error);
			toast({
				title: "Not authorized to access private note",
				description: "Please try again later",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			navigate('/');
		}
	};
	useEffect(() => {
		// Make api call to get note details
		try {
			fetchNoteDetails();
		} catch (error) {
			console.error(error);
			toast.error({ title: "Failed to fetch note details" });
		}
	}, []);

	const [open, setOpen] = useState(false);

	// Functions
	const handleBlur = (newContent) => {
		setContent(newContent);
		console.log(newContent);
	};
	const handleDescription = (e) => {
		setNoteDetails({ ...noteDetails, description: e.target.value });
		console.log(noteDetails);
	};
	const handleTags = async (tagsStr) => {
		const tagArray = tagsStr.split(",");
		// Also trim
		tagArray.forEach((tag, index) => {
			tagArray[index] = tag.trim();
		});
		// Remove empty strings
		tagArray.forEach((tag, index) => {
			if (tag === "") {
				tagArray.splice(index, 1);
			}
		});
		// We allow a maximum of 7 tags
		if (tagArray.length > 7) {
			toast({
				title: "Maximum 7 tags allowed",
				description: "Taking Your first 7 tags",
				status: "warning",
				duration: 2000,
				isClosable: true,
			});
			tagArray.splice(7, tagArray.length - 7);
		}
		setNoteDetails({ ...noteDetails, tags: tagArray });
		console.log(noteDetails);
	};
	const handleSharedWith = (emailStr) => {
		// Split by comma
		const emailArray = emailStr.split(",");
		// trim each email
		emailArray.forEach((email, index) => {
			emailArray[index] = email.trim();
		});
		// Remove empty strings
		emailArray.forEach((email, index) => {
			if (email === "") {
				emailArray.splice(index, 1);
			}
		});
		console.log(emailArray);
		setNoteDetails({ ...noteDetails, sharedWith: emailArray });
		toast({
			title: "Email Added",
			status: "success",
			duration: 1000,
			isClosable: true,
		});
		console.log(noteDetails);
	};
	const handleTitle = (e) => {
		setNoteDetails({ ...noteDetails, title: e.target.value });
	};
	const handleCategory = (e) => {
		setNoteDetails({ ...noteDetails, category: e.target.value });
	};
	const handleUnShare = async () => {
		try {
			const res = await axiosInstance.patch(`/notes/update/${id}`, {
				visibility: "private",
			});
			toast({
				title: "Successfully Unshared",
				description: "Now this note is not visible publically",
				status: "success",
				duration: 2000,
				isClosable: true,
			});
			fetchNoteDetails();
		} catch (error) {
			console.error(error);
			toast({
				title: "Failed to Unshare",
				status: error.response.msg,
				duration: 3000,
				isClosable: true,
			});
		}
	};
	const handlePublic = async () => {
		console.log(noteDetails);
		if (
			content === "<h1>Hello I am a rich text editor!</h1>" ||
			content === ""
		) {
			toast({
				title: "Note is empty",
				description: "Please write something before sharing",
				status: "warning",
				duration: 2000,
				isClosable: true,
			});
			return;
		}
		// Description, tags are necessary
		if (noteDetails.description === "" || noteDetails.tags.length === 0) {
			toast({
				title: "Description and Tags are necessary",
				description: "Please provide a description and tags",
				status: "warning",
				duration: 2000,
				isClosable: true,
			});
			return;
		}
		// Make api call to share note
		try {
			const res = axiosInstance.patch(`/notes/update/${id}`, {
				content: content,
				visibility: "public",
				description: noteDetails.description,
				tags: noteDetails.tags,
				category: noteDetails.category,
			});
			toast.promise(res, {
				loading: { title: "Sharing Note" },
				success: { title: "Note Shared" },
				error: { title: "Failed to share note" },
			});
			await res;
			fetchNoteDetails();
		} catch (error) {
			console.error(error);
		}
		console.log("Public", content);
	};
	const handlePrivate = async () => {
		if (
			content === "<h1>Hello I am a rich text editor!</h1>" ||
			content === ""
		) {
			toast({
				title: "Note is empty",
				description: "Please write something before sharing",
				status: "warning",
				duration: 2000,
				isClosable: true,
			});
			return;
		}
		// Description, tags are necessary
		if (
			noteDetails.description === "" ||
			noteDetails.tags.length === 0 ||
			noteDetails.sharedWith.length === 0
		) {
			toast({
				title: "Description and Tags are necessary",
				description: "Please provide a description and tags",
				status: "warning",
				duration: 2000,
				isClosable: true,
			});
			return;
		}
		// Make api call to share note
		try {
			// First Save the note
			const resAVE = await axiosInstance.patch(`/notes/update/${id}`, {
				content: content,
				description: noteDetails.description,
				tags: noteDetails.tags,
				category: noteDetails.category,
			});
			// Privately Share the note
			const res = axiosInstance.post(`/notes/share/${id}`, {
				email: noteDetails.sharedWith,
			});
			toast.promise(res, {
				loading: { title: "Sharing Note" },
				success: { title: "Note Shared" },
				error: { title: "Failed to share note" },
			});
		} catch (error) {
			console.error(error);
		}
		console.log("Private", content);
	};
	const handleSave = async () => {
		console.log("Save", content);
		try {
			const res = axiosInstance.patch(`/notes/update/${id}`, {
				content: content,
			});
			toast.promise(res, {
				loading: { title: "Saving Note" },
				success: { title: "Note Saved" },
				error: { title: "Failed to save note" },
			});
			// Reload the page
			const response = await res;
			setContent(response.data.note.content);
		} catch (error) {
			console.log(error);
		}
	};
	function handleOpen() {
		setOpen(!open);
	}
	return (
		<>
			<Nav />
			<div className="flex relative max-h-[90svh]">
				{!open && (
					<IoIosArrowForward
						className="w-6 h-6 lg:hidden absolute top-[50%] translate-y-[-50%] left-0 z-10"
						onClick={handleOpen}
					/>
				)}
				<EditorAside
					open={open}
					handleOpen={handleOpen}
					handlePublic={handlePublic}
					handlePrivate={handlePrivate}
					save={handleSave}
					handleDescription={handleDescription}
					handleTags={handleTags}
					handleSharedWith={handleSharedWith}
					handleTitle={handleTitle}
					handleCategory={handleCategory}
					handleUnShare={handleUnShare}
					noteDetails={noteDetails}
					socketConnection={connectSocket}
				/>
				<div className="basis-[100%] max-h-full overflow-auto">
					<div className="flex items-center justify-between h-[10svh] px-5">
						<h1 className="font-bold text-3xl">{noteDetails.title}</h1>
						{noteDetails.category && (
							<div className="flex items-center">
								<span className="text-sm bg-gray-200 py-2 px-3 rounded-l-md text-slate-600 font-semibold">
									Category:
								</span>
								<span className="text-sm text-gray-200 py-2 px-3 rounded-r-md bg-slate-600">
									{noteDetails.category}
								</span>
							</div>
						)}
					</div>
					<RichEditor content={content} handleOnBlur={handleBlur} />
				</div>
			</div>
		</>
	);
}
