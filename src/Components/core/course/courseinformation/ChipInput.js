import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux'
import { GrFormClose } from "react-icons/gr"
const ChipInput = ({
    label, name,
  placeholder,
  register,
  errors,
  setValue,
  getValues,
}) => {
    const {course, editCourse} = useSelector((state)=>state.course);
    const [chips, setChips] = useState([])

    useEffect(() => {
      if(editCourse) {
        setChips(JSON.parse(course?.tags))
      }
      register(name, {required:true, validate: (value)=> value.length > 0})

    }, [])
    
    useEffect(() => {
      setValue(name, chips)
    }, [chips])
    
    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const chipValue = e.target.value.trim();

            if(chipValue && !chips.includes(chipValue)){
                setChips([...chips, chipValue])
                e.target.value = ""
            }
        }
    }

    const handleDeleteChip = (chipIndex) => {
        const newChips = chips.filter((curr, ind) => ind!==chipIndex )
        setChips(newChips)
    }
  return (
    <div className="flex flex-col space-y-2">
      {/* Render the label for the input */}
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>
      {/* Render the chips and input */}
      <div className="flex w-full flex-wrap gap-y-2">
        {/* Map over the chips array and render each chip */}
        
        {chips.map((chip, index) => (
          <div
            key={index}
            className="m-1 flex items-center rounded-full bg-yellow-400 px-2 py-1 text-sm text-richblack-5"
          >

            {/* Render the chip value */}
            {chip}
            {/* Render the button to delete the chip */}
            <button
              type="button"
              className="ml-2 focus:outline-none"
              onClick={() => handleDeleteChip(index)}
            >
              <GrFormClose className="text-sm" />
            </button>

          </div>
        ))}

        
        {/* Render the input for adding new chips */}
        <input
          id={name}
          name={name}
          type="text"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          style={{
            boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
          }}
          className="w-full rounded-[0.5rem] bg-richblack-700 p-[12px] text-richblack-5 border border-richblack-700"
        />
      </div>
      {/* Render an error message if the input is required and not filled */}
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}

export default ChipInput