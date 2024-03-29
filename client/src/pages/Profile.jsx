import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  singoutUserFailure,
  singoutUserStart,
  singoutUserSuccess,
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
} from '../redux/user/userSlice'
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage'
import { current } from '@reduxjs/toolkit'
const Profile = () => {
  const { currentUser, loading, error } = useSelector((state) => state.user)
  const fileRef = useRef(null)
  const [file, setFile] = useState(undefined)
  const [filePercentage, setFilePercentage] = useState(0)
  const [fileUploadError, setFileUploadError] = useState(false)
  const [formData, setFormData] = useState({})
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [showListingsError, setShowListingsError] = useState(false)
  const [userListings, setUserListing] = useState([])
  const [deleteListingError, setDeleteListingError] = useState(false)
  const dispatch = useDispatch()
  const handleFileUpload = (file) => {
    const storage = getStorage()
    const fileName = new Date().getTime() + file.name
    const storageRef = ref(storage, fileName)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_change',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setFilePercentage(Math.round(progress))
      },
      (error) => setFileUploadError(true),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL })
        })
      }
    )
  }
  useEffect(() => {
    if (file) {
      handleFileUpload(file)
    }
  }, [file])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      dispatch(updateUserStart())
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success === false) {
        dispatch(updateUserFailure(data.message))
        return
      }

      dispatch(updateUserSuccess(data))
      setUpdateSuccess(true)
      setTimeout(() => setUpdateSuccess(false), 5000)
    } catch (error) {
      dispatch(updateUserFailure(error.message))
    }
  }

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart())
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message))
        return
      }
      dispatch(deleteUserSuccess())
    } catch (error) {
      deleteUserFailure(dispatch(error.message))
    }
  }

  const handleSingOut = async () => {
    try {
      dispatch(singoutUserStart())
      const response = await fetch('/api/auth/signout')
      const data = await response.json()
      if (data.success === false) {
        dispatch(singoutUserFailure(data.message))
        return
      }
      dispatch(singoutUserSuccess())
    } catch (error) {
      dispatch(singoutUserFailure(error.message))
    }
  }
  const handleShowListings = async () => {
    try {
      setShowListingsError(false)
      const res = await fetch(`/api/user/listings/${currentUser._id}`)
      const data = await res.json()
      if (data.success === false) {
        setShowListingsError(true)
        return
      }
      setUserListing(data)
    } catch (error) {
      setShowListingsError(true)
    }
  }
  const handleListingDelete = async (id) => {
    try {
      setDeleteListingError(false)
      const res = await fetch(`/api/listing/delete/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success === false) {
        setDeleteListingError(data.message)
        return
      }
      setUserListing((prev) => prev.filter((listing) => listing._id !== id))
    } catch (error) {
      console.log(error.message)
      setDeleteListingError(error.message)
    }
  }
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <input
          hidden
          type='file'
          ref={fileRef}
          accept='image/*'
          onChange={(e) => setFile(e.target.files[0])}
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />
        <p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700'>
              Error Image Upload(image must be less than 2mb)
            </span>
          ) : filePercentage > 0 && filePercentage < 100 ? (
            <span className='text-slate-700'>{`Uploading ${filePercentage}%`}</span>
          ) : filePercentage === 100 ? (
            <span className='text-green-700'>Image Successfully Uploaded!</span>
          ) : (
            ''
          )}
        </p>
        <input
          type='text'
          placeholder='username'
          className='border p-3 rounded-lg'
          onChange={handleChange}
          id='username'
          defaultValue={currentUser.username}
        />
        <input
          type='email'
          placeholder='email'
          className='border p-3 rounded-lg'
          onChange={handleChange}
          id='email'
          defaultValue={currentUser.email}
        />
        <input
          type='password'
          placeholder='password'
          className='border p-3 rounded-lg'
          onChange={handleChange}
          id='password'
        />
        <button
          disabled={loading}
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Loading...' : 'Update'}
        </button>
        <Link
          className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
          to='/create-listing'
        >
          Create Listing
        </Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span
          onClick={handleDeleteUser}
          className='text-red-700 cursor-pointer'
        >
          Delete account
        </span>
        <span onClick={handleSingOut} className='text-red-700 cursor-pointer'>
          Sign out
        </span>
      </div>
      <p className='text-red-700 mt-5'>{error ? error : ''}</p>
      <p className='text-green-700 mt-5'>
        {updateSuccess ? 'User updated successfully' : ''}
      </p>
      <button onClick={handleShowListings} className='text-green-700 w-full'>
        Show Listings
      </button>
      <p className='text-red-700 mt-5'>
        {showListingsError ? 'Error showing listings' : ''}
      </p>

      {userListings && userListings.length > 0 && (
        <div className='flex flex-col gap-4'>
          <h1 className='text-center my-7 text-2xl font-semibold'>
            Your Listings
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className='border rounded-lg p-3 flex justify-between items-center gap-4'
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  className='h-16 w-16 object-contain '
                  src={listing.imageUrls[0]}
                  alt='listing cover'
                />
              </Link>
              <Link
                className='truncate text-slate-700 font-semibold flex-1 hover:underline'
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>
              <div className='flex flex-col items-center'>
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className='text-red-700 uppercase'
                >
                  delete
                </button>
                <Link to={`/edit-listing/${listing._id}`}>
                  <button className='text-green-700 uppercase'>edit</button>
                </Link>
              </div>
            </div>
          ))}
          {deleteListingError && (
            <span className='text-red-700 text-sm'>{deleteListingError}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default Profile
