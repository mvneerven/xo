const schema = {
    pages: [
        {
            legend: "My Form",
            intro: "My form description",
            fields: [
                {
                    type: "password",
                    name: "pwd1",
                    caption: "Enter your password",
                    required: true,
                    pattern: "(?=.*d)(?=.*[a-z])(?=.*[A-Z]).{8,}",
                    info: "Please enter a strong password",
                    prefix: {
                        icon: "ti-key"
                    },
                    invalidmessage: "Password must be at least 8 characters long, and must contain at least one number and uppercase and lowercase letters"
                }
            ]
        }
    ]
}