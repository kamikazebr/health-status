import { NextApiRequest, NextApiResponse } from "next"
import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getCsrfToken } from "next-auth/react"
import { SiweMessage } from "siwe"

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  providers : [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"))
          const domain = process.env.DOMAIN
          if (siwe.domain !== domain) {
            console.log('siwe.domain',siwe.domain)  
            console.log('domain',domain)  
            return null
          }
          
          // if (siwe.nonce !== (await getCsrfToken({ req }))) {
          //   console.log('siwe.nonce',siwe.nonce)  
          //   return null
          // }
          
          await siwe.validate(credentials?.signature || "")
          console.log('addres',siwe.address)
          if (!(process.env.ADDRESS_ALLOWLIST.split(",").map(ad=>ad.toLocaleLowerCase()).includes(siwe.address.toLowerCase()))){
            console.log('process.env.ADDRESS_ALLOWLIST',process.env.ADDRESS_ALLOWLIST)
            return null;
          }
          return {
            id: siwe.address,
          }
        } catch (e) {
          console.log('e',e)  
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
  },
  secret: process.env.NEXT_AUTH_SECRET || 'secret',
  callbacks: {
    async session({ session, token }) {
      session.address = token.sub
      if (session.user){
        session.user.name = token.sub 
      }else{
        session.user = {
          name:token.sub
        }
      }
      return session
    },
  },
}

export default NextAuth(authOptions)