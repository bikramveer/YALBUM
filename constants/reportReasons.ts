export type ContentType = 'photo' | 'comment' | 'profile_picture' | 'username'
 
export const REPORT_REASONS: Record<ContentType, string[]> = {
    photo: [
        'Inappropriate or NSFW content',
        'Spam',
        'Violence or dangerous content',
        'Copyright violation',
        'Other (please specify)',
    ],
    comment: [
        'Harassment or bullying',
        'Hate speech',
        'Spam or irrelevant',
        'Threats or violence',
        'Other (please specify)',
    ],
    profile_picture: [
        'Inappropriate image',
        'Impersonation',
        'Other (please specify)',
    ],
    username: [
        'Inappropriate name',
        'Impersonation',
        'Other (please specify)',
    ],
}