// For general emails which consist of a title & text
export interface EmailContent {
  subject: string,
  title: string,
  text: string
}

export interface ButtonEmailContent extends EmailContent{
  buttonUrl: string,
  buttonText: string
}
