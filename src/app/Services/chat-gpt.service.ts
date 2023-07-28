import { Injectable } from '@angular/core';
import { Configuration, CreateCompletionRequest, CreateCompletionResponse, OpenAIApi } from 'openai';

@Injectable({
  providedIn: 'root'
})
export class ChatGptService {
  private openai: OpenAIApi;
  configuration = new Configuration({
    apiKey: "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",
  });

  constructor() {
    this.openai = new OpenAIApi(this.configuration);
  }

  generateText(prompt: string): Promise<string | undefined> {
    return this.openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 256
    }).then((response: any) => {
      return response.data.choices[0].text;
    }).catch((error: any) => {
      return '';
    });
  }
  async sendMessage(message: string): Promise<string> {
    const prompt = 'User: ' + message + '\nAI:';
    const requestPayload: CreateCompletionRequest = {
      model: 'davinci', // Replace with the desired model, e.g., 'davinci' or 'curie'
      prompt,
      max_tokens: 50 // Adjust the number of tokens as needed
    };
    console.log(message);
    try {
      const response = await this.openai.createCompletion(requestPayload, { responseType: 'json' });
      console.log(response);
      const completion: CreateCompletionResponse = response.data;
      if (completion && completion.choices && completion.choices.length > 0) {
        const firstChoice = completion.choices[0];

        if (firstChoice && firstChoice.text) {
          return firstChoice.text.trim();
        }
      }

      throw new Error('Empty completion');
    } catch (error) {
      console.error('Failed to send message:', error);
      return 'Oops, something went wrong.';
    }
  }
}
