import { useState, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { storage } from "../../config/firebaseConfig";
import { auth } from "../../config/firebaseConfig";
import { update, ref as refDB } from "firebase/database";
import { database } from "../../config/firebaseConfig";
import { User } from "firebase/auth";
import { Button, Box, Text } from "@chakra-ui/react";

export const PhotoUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const handleFileUpload = () => {
    if (!file) {
      return;
    }

    const metadata = {
      contentType: file.type,
    };

    const storageRef = ref(storage, `users/${user?.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        setUploadProgress(progress);
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        console.error(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          updateProfile(auth.currentUser as User, {
            photoURL: downloadURL,
          })
            .then(() => {
              console.log("Profile photo updated successfully");
              setUser((prevUser) => {
                if (prevUser && auth.currentUser) {
                  return { ...auth.currentUser, photoURL: downloadURL };
                }
                return prevUser;
              });

              const userRef = refDB(database, `users/${user?.uid}`);
              update(userRef, { photoURL: downloadURL })
                .then(() => {
                  console.log("Photo URL updated successfully");
                })
                .catch((error) => {
                  console.error("Error updating photo URL:", error);
                });
            })
            .catch((error) => {
              console.error("Error updating profile photo:", error);
            });
        });
      }
    );
  };

  return (
    <Box mt={4}>
      {user && user.photoURL && (
        <Box alignContent={"center"} mb={5}>
          <Text mb={5}>Current profile photo:</Text>
          <img src={user.photoURL} alt="Profile" width="100" height="100" />
        </Box>
      )}
      <Box display="flex" alignItems="center">
        <input type="file" onChange={handleFileInputChange} />
        <Button onClick={handleFileUpload} variant="ghost">
          Upload
        </Button>
      </Box>
      {uploadProgress > 0 && (
        <p>Upload progress: {uploadProgress.toFixed(2)}%</p>
      )}
    </Box>
  );
};
