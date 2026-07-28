import { CreateProducts, GetProducts } from "@/app/services/product.service";
import { Productvalidation } from "@/app/validators/product.validator";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const body = await request.json();
    // const validate=Productvalidation.safeParse(body)
    //      if(!validate.success){
    //         return NextResponse.json({
    //             success:false,
    //             errors: validate.error
    //         })
    //      }
    const data = await CreateProducts(body);
    return NextResponse.json({
      success: true,
      body: data,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create product",
        error: error.message,
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const data = await GetProducts();
    return NextResponse.json({
      success: true,
      body: data,
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch products",
      },
      { status: 400 }
    );
  }
}

