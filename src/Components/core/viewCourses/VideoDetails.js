import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { markLectureAsComplete } from '../../../services/operation/courseDetails';
import { updateCompletedLectures } from '../../../slices/viewCourseSlice';
import { BigPlayButton, Player } from "video-react"

import 'video-react/dist/video-react.css';

import {AiFillPlayCircle} from "react-icons/ai"
import IconBtn from '../../common/IconBtn';

const VideoDetails = ({isVisible }) => {
    const {courseId, sectionId, subSectionId} = useParams();
    console.log("subsection id",subSectionId);
  const navigate = useNavigate(); 
  const dispatch = useDispatch();
  const location = useLocation();
  const playerRef = useRef();
  const {token} = useSelector((state)=>state.auth);
  const {courseSectionData, courseEntireData, completedLectures} = useSelector((state)=>state.viewCourse);
  const [previewSource, setPreviewSource] = useState("")
  const [videoData, setVideoData] = useState([]);
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);
    
  useEffect(() => {
    const setVideoSpecificDetails = () => {
        // console.log("In VideoDetails, courseSectionData",courseSectionData)
        if(!courseSectionData.length)
            return;
        if(!courseId && !sectionId && !subSectionId) {
            navigate("/dashboard/enrolled-courses");
        }
        else {
            //let's assume k all 3 fields are present

            const filteredData = courseSectionData.filter(
                (course) => course._id === sectionId
            )
console.log("filtered data",filteredData);
            const filteredVideoData = filteredData?.[0].subSection.filter(
                (data) => data._id === subSectionId
            )

            setVideoData(filteredVideoData[0]);
            setPreviewSource(courseEntireData.thumbnail)
            setVideoEnded(false);

        }
    }
    setVideoSpecificDetails();
  }, [courseSectionData, courseEntireData, location.pathname])
  
  const isFirstVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex(
        (data) => data._id === sectionId
    )

    const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
        (data) => data._id === subSectionId
    )
    if(currentSectionIndex === 0 && currentSubSectionIndex === 0) {
        return true;
    }
    else {
        return false;
    }
  } 

  const isLastVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex(
        (data) => data._id === sectionId
    )

    const noOfSubSections = courseSectionData[currentSectionIndex].subSection.length;

    const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
        (data) => data._id === subSectionId
    )

    if(currentSectionIndex === courseSectionData.length - 1 &&
        currentSubSectionIndex === noOfSubSections - 1) {
            return true;
        }
    else {
        return false;
    }


  }

  const goToNextVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex(
        (data) => data._id === sectionId
    )

    const noOfSubSections = courseSectionData[currentSectionIndex].subSection.length;

    const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
        (data) => data._id === subSectionId
    )

    if(currentSubSectionIndex !== noOfSubSections - 1) {
        //same section ki next video me jao
        const nextSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSectionIndex + 1]._id;
        //next video pr jao
        navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`)
    }
    else {
        //different section ki first video
        const nextSectionId = courseSectionData[currentSectionIndex + 1]._id;
        const nextSubSectionId = courseSectionData[currentSectionIndex + 1].subSection[0]._id;
        ///iss voide par jao 
        navigate(`/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`)
    }
  }

  const goToPrevVideo = () => {

    const currentSectionIndex = courseSectionData.findIndex(
        (data) => data._id === sectionId
    )

    const noOfSubSections = courseSectionData[currentSectionIndex].subSection.length;

    const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
        (data) => data._id === subSectionId
    )

    if(currentSubSectionIndex != 0 ) {
        //same section , prev video
        const prevSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSubSectionIndex - 1];
        //iss video par chalge jao
        navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`)
    }
    else {
        //different section , last video
        const prevSectionId = courseSectionData[currentSectionIndex - 1]._id;
        const prevSubSectionLength = courseSectionData[currentSectionIndex - 1].subSection.length;
        const prevSubSectionId = courseSectionData[currentSectionIndex - 1].subSection[prevSubSectionLength - 1]._id;
        //iss video par chalge jao
        navigate(`/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`)

    }


  }

  const handleLectureCompletion = async() => {

    ///dummy code, baad me we will replace it witht the actual call
    setLoading(true);
    //PENDING - > Course Progress PENDING
    const res = await markLectureAsComplete({courseId: courseId, subSectionId: subSectionId}, token);
    console.log("res",res);
    //state update
    if(res) {
        dispatch(updateCompletedLectures(subSectionId)); 
    }
    setLoading(false);

  }
  return (
    <div className={`flex-1 transition-all bg-pure-greys-5 duration-500 ${isVisible ? 'w-3/4' : 'w-full'}`}>
      <div className="flex flex-col text-white mx-14 my-10">
        {!videoData ? (
          <img src={previewSource} alt="Preview" className="h-full w-full rounded-md object-cover" />
        ) : (
          <Player
          
            ref={playerRef}
            aspectRatio="4:2"
            playsInline
            onEnded={() => setVideoEnded(true)}
            src={videoData?.videoUrl}
           
          >
            <BigPlayButton position="center" />
            {videoEnded && (
              <div
                style={{
                  backgroundImage: "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
                }}
                className="absolute inset-0 z-[100] grid h-full place-content-center font-inter"
              >
                {!completedLectures.includes(subSectionId) && (
                  <IconBtn
                    onclick={handleLectureCompletion}
                    text="Mark As Completed"
                    customClasses="text-xl max-w-max px-4 mx-auto"
                  />
                )}
                <button
                  disabled={loading}
                  onClick={() => {
                    if (playerRef?.current) {
                      playerRef.current?.seek(0);
                      setVideoEnded(false);
                    }
                  }}
                  id='blue'
                  className=" text-xl max-w-max mx-auto mt-2  text-white font-bold py-2 px-4 rounded"
                >
                  Rewatch
                </button>
                <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                  {!isFirstVideo() && (
                    <button onClick={goToPrevVideo} className='blackButton'>
                      Prev
                    </button>
                  )}
                  {!isLastVideo() && (
                    <button onClick={goToNextVideo} className='blackButton'>
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </Player>
        )}
        <h1 className="mt-4 text-3xl text-richblack-700 font-semibold">
          {videoData?.title}
        </h1>
        {/* <p className="pt-2 pb-6 text-richblack-700 text-base font-normal">
          {videoData?.description}
        </p> */}
      </div>
    </div>
     );
    };
    
    export default VideoDetails;