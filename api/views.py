import base64
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.base import ContentFile
from .models import Drawing
from django.shortcuts import get_object_or_404
from django.conf import settings
import replicate

@csrf_exempt
def upload_image(request):
    if request.method == 'POST':
        try:
            # Get the base64 image data from the POST request
            base64_data = request.POST.get('image', '')

            # Decode the base64 data and create a ContentFile
            image_data = base64.b64decode(base64_data.split(",")[1])
            image_file = ContentFile(image_data, name='temp.png')

            # Save the image file to the media folder
            drawing = Drawing.objects.create(image=image_file)

            # Return the drawing token or ID in the response
            response_data = {'message': 'Image saved successfully', 'drawing': drawing.id}
            return JsonResponse(response_data)
        except Exception as e:
            # Handle any exceptions that may occur during the process
            error_message = str(e)
            response_data = {'error': error_message}
            return JsonResponse(response_data, status=500)
    else:
        # Return an error response if the request method is not POST
        response_data = {'error': 'Invalid request method'}
        return JsonResponse(response_data, status=400)


def generate_image(request, drawing_id):
    try:
        prompt = request.GET.get('prompt', 'a flower')
        drawing = get_object_or_404(Drawing, pk=drawing_id)
        image_data = drawing.image.url
        image = open(f"{settings.BASE_DIR}/{image_data}", "rb")
        
        output = replicate.run(
        "rossjillian/controlnet:795433b19458d0f4fa172a7ccf93178d2adb1cb8ab2ad6c8fdc33fdbcd49f477",
        input={
            "eta": 0,
            "seed": 20,
            "image": image,
            "scale": 9,
            "steps": 20,
            "prompt": prompt,
            "scheduler": "DDIM",
            "structure": "scribble",
            "num_outputs": 1,
            "low_threshold": 100,
            "high_threshold": 200,
            "negative_prompt": "Longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
            "image_resolution": 512,
            "return_reference_image": False
        })
        
        return JsonResponse({'image': output})
    except Exception as e:
        return JsonResponse({'error': str(e)})