import RichEditor from "./RichEditor";
import EditorAside from "./EditorAside";
import axiosInstance from "../../Helpers/axiosInstance";
import { useToast } from "@chakra-ui/react";
import { IoIosArrowForward } from "react-icons/io";
import Nav from "../../Layouts/Nav";
import "./editor.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function CreateNote() {
	const {id} = useParams();
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

	// Fetch note details
	const fetchNoteDetails = async () => {
		console.log("Fetching note details");
		try {
			const res = await axiosInstance.get(`/notes/${id}`);
			console.log(res.data.note);
			setNoteDetails(res.data.note);
			setContent(res.data.note.content);
		} catch (error) {
			console.error(error);
			toast({
				title: "Failed to fetch note details",
				description: "Please try again later",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		}
	}
	useEffect(() => {
		// Make api call to get note details
		try {
			fetchNoteDetails();
		} catch (error) {
			console.error(error);
			toast.error({title : "Failed to fetch note details"})
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
	}
	const handleTags = (e) => {
		const tagArray = e.target.value.split(",");
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
			})
			tagArray.splice(7, tagArray.length - 7);
		}
		console.log(tagArray);
		setNoteDetails({ ...noteDetails, tags: tagArray });
	}
	const handleSharedWith = (e) => {
		const email = e.target.value;
		// Split by comma
		const emailArray = email.split(",");
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
		setNoteDetails({ ...noteDetails, sharedWith: email });
	}
	const handleTitle = (e) => {
		setNoteDetails({ ...noteDetails, title: e.target.value });
	}
	const handleCategory = (e) => {
		setNoteDetails({ ...noteDetails, category: e.target.value });
	}
	const handlePublic = () => {
		if(content === "<h1>Hello I am a rich text editor!</h1>" || content === "") {
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
		if(noteDetails.description === "" || noteDetails.tags.length === 0) {
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
		try{
			const res = axiosInstance.patch(`/notes/update/${id}`, {
				content: content,
				visibility: "public",
				description: noteDetails.description,
				tags: noteDetails.tags,
				category: noteDetails.category,
			});
			toast.promise(res, {
				loading: {title: "Sharing Note"},
				success: {title: "Note Shared"},
				error: {title: "Failed to share note"},
			});
		}
		catch(error){
			console.error(error);
		}
		console.log("Public", content);
	};
	const handlePrivate = async () => {
		if(content === "<h1>Hello I am a rich text editor!</h1>" || content === "") {
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
		if(noteDetails.description === "" || noteDetails.tags.length === 0) {
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
		try{
			// First Save the note
			const resAVE = await axiosInstance.patch(`/notes/update/${id}`, {
				content: content,
				description: noteDetails.description,
				tags: noteDetails.tags,
				category: noteDetails.category,
			});
			// Privately Share the note
			const res = axiosInstance.post(`/notes/share/${id}`, {email})
			toast.promise(res, {
				loading: {title: "Sharing Note"},
				success: {title: "Note Shared"},
				error: {title: "Failed to share note"},
			});
		}
		catch(error){
			console.error(error);
		}
		console.log("Private", content);
	};
	const handleSave = async () => {
		console.log("Save", content);
		try {
			const res = axiosInstance.patch(`/notes/update/${id}`, {
				content: content
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
					noteDetails={noteDetails}
				/>
				<div className="basis-[100%] max-h-full overflow-auto">
					<div className="flex items-center justify-between h-[10svh] px-5">
						<h1 className="font-bold text-3xl">{noteDetails.title}</h1>
						{noteDetails.category && <div className="flex items-center">
							<span className="text-sm bg-gray-200 py-2 px-3 rounded-l-md text-slate-600 font-semibold">
								Category:
							</span>
							<span className="text-sm text-gray-200 py-2 px-3 rounded-r-md bg-slate-600">
								{noteDetails.category}
							</span>
						</div>}
					</div>
					<RichEditor content={content} handleOnBlur={handleBlur} />
				</div>
			</div>
		</>
	);
}
