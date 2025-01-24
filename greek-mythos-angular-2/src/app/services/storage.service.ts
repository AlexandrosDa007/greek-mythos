import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { first } from 'rxjs/operators';


export const IMAGE_TYPE_TO_EXTENSION = {
    'image/png': '.png',
    'image/jpeg': '.jpg'
};

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    constructor(
        private storage: AngularFireStorage,
    ) { }

    async uploadImage(image: File, userUid: string): Promise<any> {
        console.log(image);

        if (image.type !== 'image/jpeg' && image.type !== 'image/png') {
            throw new Error(`Image type is not supported! Only jpg and png.`);
        }
        try {
            // const newBlob = await ImageBlobReduce().toBlob(image, { max: 400 });
            const newFileName = `profileImage${IMAGE_TYPE_TO_EXTENSION[image.type]}`
            // const newFile = new File([newBlob], newFileName);

            const path = `users/${userUid}/${newFileName}`;
            const task = this.storage.upload(path, image, {contentType: `${image.type}`});
            return task.then((taskSnapshot) => {
                console.log('download url');
                return taskSnapshot.ref.getDownloadURL();
            }, (error) => {
                // Upload failed...
                console.error('Error uploading image' + error.message);
                return null;
            });
        } catch (error) {
            console.error(error);
            return;
        }
    }

    async deleteImage(imageUrl: string): Promise<boolean> {
        return this.storage.refFromURL(imageUrl).delete().pipe(first()).toPromise()
            .then(() => true)
            .catch(() => false);
    }
}