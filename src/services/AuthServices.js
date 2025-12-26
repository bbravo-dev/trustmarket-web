import { supabase } from "../lib/supabase";

//register new user
export async function registerUser (email, password){
    const {data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

//login user
export async function loginUser (email, password){
    const {data, error} = await supabase.auth.loginUser({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

//logout user
export async function logOutUser(){
    await supabase.auth.signOut
}