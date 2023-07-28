import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ChatGptService } from 'src/app/Services/chat-gpt.service';

interface FacebookPage {
  id: string;
  name: string;
}

interface StepRow {
  description: string;
  method: string;
  endpoint: string;
  requestQueryParams: any;
  isDisabled: boolean;
}
export class textResponse {
  sno: number = 1;
  text: string = '';
  response: string = '';
}
declare var FB: any;
@Component({
  selector: 'app-media-upload',
  templateUrl: './media-upload.component.html',
  styleUrls: ['./media-upload.component.scss']
})
export class MediaUploadComponent {
  mydata: { url: string; type: string; name?: string }[] = [];
  isButtonDisabled!: false;
  isPostAdded: boolean = false;
  bioText: string = '';
  remainingWords: number = 350;
  textList: textResponse[] = [{ sno: 1, text: '', response: '' }];
  showSpinner = false;
  cardText: any;
  writeText!: any;
  isAIAssistOpen: boolean = false;
  formData: FormData = new FormData();
  pageId: string = '110499812113968';
  accessToken = 'EAADjr33njLcBANe4DL6TUAe0fUVKIkPPCXPrcfZB0WdN9p9u5sRdQtPn3JT0smHPRU2Xx9MdnpafIVyWCTuQpMHY9t9EX8mrKW1fDZAIUfD66cDhNqQ3cOMIXEjRlINmasM0Vh5qTW8X6PSMWnPDAjSODYx2OgoGMXSKtIYFZA47YhcPsoSVvok8TpZAxzyGgYVQGtnL1Unu5uPBQP8RzFtegvMLaDIdFd1aj8Ok87tF4xHt8nYL';

  hashtags = [
    { id: "spread", value: "#spread", color: 3, twitter: "8", instagram: null },
    { id: "forget", value: "#forget", color: 3, twitter: "8", instagram: null },
  ];
  myNewData: any;
  shareLink: any;
  newTextList: textResponse[] = [{ sno: 1, text: '', response: '' }];
  hastageCardText: any;
  imagesData: any;
  taggedUsername: any;
  imageUrl: string = '';
  postCaption: string = '';
  isSharingPost: boolean = false;
  hashtageStorge: any;
  imagePreview: any;
  constructor(private openaiService: ChatGptService, private http: HttpClient, private cdRef: ChangeDetectorRef, private toaster: ToastrService) { }
  ngOnInit() {
    this.textList = [{ sno: 1, text: '', response: '' }];
    this.cardText = this.textList[0];
  }
  hastageText(dataList: textResponse[], searchText: any) {
    this.showSpinner = true;
    const generatedTextPromises = dataList.map((data: textResponse) => {
      const prompt = 'User: ' + searchText + '\nAI:';
      return this.openaiService.generateText(prompt).then((text: any) => {
        data.response = text;
        this.newTextList.unshift({ sno: 0, text: data.text, response: text });
        this.hastageCardText = this.newTextList.find(f => f.response);
        this.hashtageStorge = this.hastageCardText.response
        this.writeText = this.newTextList.find(f => f.text);
        this.filterHashtags();
        return { text, response: text };
      });
    });

    Promise.all(generatedTextPromises).then((results: any[]) => {
      const hashtagResponses = results.filter((result) => {
        const response = result.response.toLowerCase();
        return response.startsWith('#') || response.includes(' #');
      });

      this.hashtags = hashtagResponses.map((result) => {
        return result.response;
      });

      this.filterHashtags();
    });
  }
  // ChatGPT
  generateText(dataList: textResponse[], userInput: any) {
    this.showSpinner = true;
    const generatedTextPromises = dataList.map((data: textResponse) => {
      const prompt = 'User: ' + userInput + '\nAI:';
      return this.openaiService.generateText(prompt).then((text: any) => {
        data.response = text;
        this.textList.unshift({ sno: 0, text: data.text, response: text });
        this.cardText = this.textList.find(f => f.response) ?? new textResponse();
        this.writeText = this.textList.find(f => f.text);
        this.filterHashtags();
        return { text, response: text };
      });
    });

    Promise.all(generatedTextPromises)
      .then((generatedTexts) => {
        localStorage.setItem('generatedTexts', JSON.stringify(generatedTexts));
        this.showSpinner = false;
      })
      .catch((error) => {
        console.error('Failed to generate text:', error);
        this.showSpinner = false;
      });

  }

  updateCharacterCount() {
    const words = this.bioText.trim().split(/\s+/);
    const wordCount = words.length;
    if (this.bioText.length === 0) {
      this.remainingWords = 350;
    } else {
      this.remainingWords = Math.max(0, 350 - wordCount);
    }
  }

  toggleAIAssist() {
    this.isAIAssistOpen = !this.isAIAssistOpen;
    this.isPostAdded = !this.isPostAdded;
  }

  addHashtagToBio(hashtag: string) {
    this.cardText.response += ' ' + hashtag;
  }
  isHashtagDropdownOpen = false;
  searchTerm: any = "";
  filteredHashtags: any = [];

  toggleHashtagDropdown() {
    this.isHashtagDropdownOpen = !this.isHashtagDropdownOpen;
    if (this.isHashtagDropdownOpen) {
      this.filterHashtags();
    }
  }

  filterHashtags() {
    this.filteredHashtags = this.hashtags.filter(
      (hashtag) => hashtag.value.toLowerCase().includes(this.searchTerm.toLowerCase())
        || this.bioText.toLowerCase().includes(hashtag.value.toLowerCase())
    );
  }

  truncateText(text: string, wordLimit: number): string {
    const words = text.trim().split(/\s+/);
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  }
  selectHashtag(hashtag: { value: string; }) {
    this.bioText += " " + hashtag.value;
  }

  selectedFile: File | null = null;
  onSelectFacebook(event: any) {
    const fileReader: FileReader = new FileReader();
    const file = event.target.files[0];
    this.selectedFile = file;
    const pageAccessToken = 'EAADjr33njLcBABvIXnITjmpd1wgUYrkmgq9XIq6zSZBqpfnoDlAJbNLal83fZBUYRbiStAi7cHOkBRlwprVaEqVuFHO4DcWv7KvvZCZCXoJ2SsvuvhRxoGolyfnln4hg0uur6opRo5SSEZBQV9SAutBtZBGHra9T58BNXE8peFtIS7vEgx65tnjrGUQ1cHA4LHc0ihIJYTMFuJWxUugOGK';
    fileReader.onloadend = () => {
      const photoData = new Blob([fileReader.result as ArrayBuffer], { type: 'image/jpg' });
      const formData = new FormData();
      formData.append('access_token', pageAccessToken);
      formData.append('source', photoData);
      this.imagePreview = URL.createObjectURL(file);
      console.log(this.selectedFile);
      document.body.appendChild(this.imagePreview);
      console.log(this.selectedFile);
    };

    fileReader.readAsArrayBuffer(file);
  }

  publishToFacebook(formData: FormData, pageId: any, selectedFiles: File[]) {
    const publishURL = `https://graph.facebook.com/${pageId}/videos`;
    const publishPhotoURL = `https://graph.facebook.com/${pageId}/photos`;
    // const publishFeedURL = `https://graph.facebook.com/${pageId}/feed`;
    const captionWithText = `${this.hastageCardText.response} ${this.cardText.response}`;
    const uploadPromises = [];
    const feedPromises = [];

    for (const file of selectedFiles) {
      if (file instanceof File) {
        const fileType = file.type;
        const isImage = fileType.startsWith('image/');
        const isVideo = fileType.startsWith('video/');

        if (isImage || isVideo) {
          const uploadFormData = new FormData();
          uploadFormData.append('access_token', formData.get('access_token') as string);
          uploadFormData.append('source', file);
          uploadFormData.append('message', captionWithText);
          uploadFormData.append('name_tags', JSON.stringify([{ name_tags: this.taggedUsername }]));

          if (isImage) {
            uploadFormData.append('source', file);
            uploadPromises.push(
              fetch(publishPhotoURL, {
                body: uploadFormData,
                method: 'POST'
              })
                .then((response) => response.json())
                .then((responseData) => {
                  console.log('Photo published successfully:', responseData);
                })
                .catch((error) => {
                  console.error('Error publishing photo:', error);
                })
            );
          } else if (isVideo) {
            uploadFormData.append('file_url', file);
            uploadPromises.push(
              fetch(publishURL, {
                body: uploadFormData,
                method: 'POST'
              })
                .then((response) => response.json())
                .then((responseData) => {
                  console.log('Video published successfully:', responseData);
                })
                .catch((error) => {
                  console.error('Error publishing video:', error);
                })
            );
          }
        } else {
          console.error('Unsupported file type:', fileType);
        }
      } else {
        console.error('Invalid file:', file);
      }
    }

    // const feedFormData = new FormData();
    // feedFormData.append('access_token', formData.get('access_token') as string);
    // feedFormData.append('description', captionWithText);
    // feedFormData.append('user_tags', this.taggedUsername); // Add the bio text

    // feedPromises.push(
    //   fetch(publishFeedURL, {
    //     body: feedFormData,
    //     method: 'POST'
    //   })
    //     .then((response) => response.json())
    //     .then((responseData) => {
    //       console.log('Feed post published successfully:', responseData);
    //     })
    //     .catch((error) => {
    //       console.error('Error publishing feed post:', error);
    //     })
    // );

    Promise.all([...uploadPromises])
      .then(() => {
        console.log('All files and feed post published successfully.');
      })
      .catch((error) => {
        console.error('Error publishing files and feed post:', error);
      });
  }

  async onPublishClick() {
    const captionWithText = `${this.hastageCardText.response} ${this.cardText.response} `;
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('access_token', this.accessToken);
      formData.append('message', captionWithText);
      formData.append('name_tags', JSON.stringify([{ name_tags: this.taggedUsername }]));

      const selectedFiles = Array.isArray(this.selectedFile) ? this.selectedFile : [this.selectedFile];

      for (const file of selectedFiles) {
        formData.append('file', file);
      }
      try {
        await this.publishToFacebook(formData, this.pageId, selectedFiles);
        this.toaster.success('Post published successfully!', 'Success');
      } catch (error) {
        console.error('Error publishing the post:', error);
        this.toaster.error('Error publishing the post. Please try again later.', 'Error');
      }
    } else {
      console.error('No file selected.');
      this.toaster.error('Please select a file before publishing.', 'Error');
    }
  }
}



