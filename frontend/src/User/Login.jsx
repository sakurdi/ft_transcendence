import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"
import TextInput, { PasswordInput } from "../components/TextInput"
import useAuth from "./AuthProvider";
import useNotif from "../components/Notif";
import Card from "../components/Card";

export default function Login() {
    const userHandle = useAuth()
    const notifHandle = useNotif()
    const navigate = useNavigate()

    const [values, setValuesInt] = useState({
        username: '',
        password: '',
    })

    const setValue = (field, value) => {
        setValuesInt(prev => ({ ...prev, [field]: value }))
    }

    useEffect(() => {
        if (userHandle.loading) return
        if (userHandle.user) {
            notifHandle.pushSuccess("You are already logged in")
            navigate('/')
        }
    }, [userHandle.loading])

    function handleEnter(event) {
        if (event.key === "Enter") {
            const form = event.target.form;
            const index = [...form].indexOf(event.target);
            if (form[index + 1]) form[index + 1].focus();
            event.preventDefault()
        }
    }

    async function onSubmit() {
        try {
            await userHandle.login(values.username, values.password)
            notifHandle.pushSuccess(`Logged in as ${values.username}`)
            navigate('/')
        } catch (error) {
            setValuesInt(prev => ({ ...prev, password: "" }))
            notifHandle.pushError(error)
        }
    }

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-md">
                <Card
                    title="Welcome Back"
                    description="Please enter your details to sign in."
                >
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={e => { e.preventDefault(); onSubmit() }}
                    >
                        <TextInput
                            value={values.username}
                            onChange={(username) => setValue("username", username)}
                            placeholder="Username"
                        />
                        <PasswordInput
                            value={values.password}
                            onChange={(password) => setValue("password", password)}
                            onEnter={onSubmit}
                        />

                        <Button type="submit" variant="primary" className="w-full mt-2">
                            Sign In
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    )
}