const prisma={
    user:{
        create:jest.fn(),
        findUnique:jest.fn(),
        update:jest.fn(),
    },

}

export default prisma