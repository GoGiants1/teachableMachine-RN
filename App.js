import React, { useState, useEffect }  from 'react';
import { StyleSheet, View,Image, Text } from 'react-native';
import { Button, Input } from 'react-native-elements';
import Svg, {Rect} from 'react-native-svg';
import * as tf from '@tensorflow/tfjs';
import { fetch, bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as tmImage from '@teachablemachine/image';

// import * as blazeface from '@tensorflow-models/blazeface';
import * as jpeg from 'jpeg-js'

let model
export default function App() {
    // const [imageLink,setImageLink] = useState("https://raw.githubusercontent.com/ohyicong/masksdetection/master/dataset/without_mask/142.jpg")
    const [imageLink,setImageLink] = useState("https://i.ibb.co/Kj4yc7t/IMG-8947.jpg")
    const [isEnabled,setIsEnabled] = useState(true)
    // const [faces,setFaces]=useState([])
    // const [faceDetector,setFaceDetector]=useState("")
    const [maskDetector,setMaskDetector]=useState("")
    const [moire, setMoire] = useState(0);
    const [normal, setNormal] = useState(0);
    useEffect(() => {
      async function loadModel(){
        console.log("[+] Application started")
        //Wait for tensorflow module to be ready
        const tfReady = await tf.ready();
        console.log("[+] Loading custom mask detection model")
        //Replce model.json and group1-shard.bin with your own custom model
        const modelJson = await require("./assets/model/model.json");
        const modelWeight = await require("./assets/model/group1-shard.bin");
        // const modelMetaData = await require("./assets/model/metadata.json");
        const modelJson2 = "https://teachablemachine.withgoogle.com/models/zgaSAS6YF/model.json";
        const modelMetaData = "https://teachablemachine.withgoogle.com/models/zgaSAS6YF/metadata.json";
        model = await tmImage.load(modelJson2,modelMetaData);
        // const maskDetector = await tf.loadLayersModel(bundleResourceIO(modelJson,modelWeight));
        const maskDetector = await tf.loadLayersModel("https://teachablemachine.withgoogle.com/models/zgaSAS6YF/model.json");
        // console.log("[+] Loading pre-trained face detection model")
        //Blazeface is a face detection model provided by Google
        // const faceDetector =  await blazeface.load();
        //Assign model to variable
        // console.log(modelJson)
        // console.log(modelMetaData)
        // console.log(modelWeight)
        // console.log(model)
        maskDetector.summary()
        setMaskDetector(maskDetector)
        // setFaceDetector(faceDetector)
        console.log(maskDetector)
        console.log("[+] Model Loaded")
      }
      loadModel()
    }, []); 
    function imageToTensor(rawImageData){
      //Function to convert jpeg image to tensors
      const TO_UINT8ARRAY = true;
      const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY);
      // Drop the alpha channel info for mobilenet
      const buffer = new Uint8Array(width * height * 3);
      let offset = 0; // offset into original data
      for (let i = 0; i < buffer.length; i += 3) {
        buffer[i] = data[offset];
        buffer[i + 1] = data[offset + 1];
        buffer[i + 2] = data[offset + 2];
        offset += 4;
      }
      return tf.tensor3d(buffer, [height, width, 3]);
    }


    
    // const getFaces = async() => {
    //   try{
    //     console.log("[+] Retrieving image from link :"+imageLink)
    //     const response = await fetch(imageLink, {}, { isBinary: true });
    //     const rawImageData = await response.arrayBuffer();
    //     const imageTensor = imageToTensor(rawImageData).resizeBilinear([224,224])
    //     const faces = await faceDetector.estimateFaces(imageTensor, false);
    //     var tempArray=[]
    //     //Loop through the available faces, check if the person is wearing a mask. 
    //     for (let i=0;i<faces.length;i++){
    //       let color = "red"
    //       let width = parseInt((faces[i].bottomRight[1] - faces[i].topLeft[1]))
    //       let height = parseInt((faces[i].bottomRight[0] - faces[i].topLeft[0]))
    //       let faceTensor=imageTensor.slice([parseInt(faces[i].topLeft[1]),parseInt(faces[i].topLeft[0]),0],[width,height,3])
    //       faceTensor = faceTensor.resizeBilinear([224,224]).reshape([1,224,224,3])
    //       let result = await maskDetector.predict(faceTensor).data()
    //       //if result[0]>result[1], the person is wearing a mask
    //       if(result[0]>result[1]){
    //         color="green"
    //       }
    //       tempArray.push({
    //         id:i,
    //         location:faces[i],
    //         color:color
    //       })
    //     }
    //     setFaces(tempArray)
    //     console.log("[+] Prediction Completed")
    //   }catch{
    //     console.log("[-] Unable to load image")
    //   }
      
    // }

    const predict = async () => {
      console.log("[+] Retrieving image from link :"+imageLink)
      const response = await fetch(imageLink, {}, { isBinary: true });
      const imageee = await require("./assets/IMG_8947.jpg");

      console.log('res',response)
      console.log('local',imageee)
      const rawImageData = await imageee.arrayBuffer();
      // const imageData = new Uint8Array(rawImageData)
      
      console.log('raw',rawImageData)
      // const imageTensor = decodeJpeg(imageData)
      const imageTensor = imageToTensor(rawImageData).resizeBilinear([224,224])
      const re = imageTensor.resizeBilinear([224,224]).reshape([1,224,224,3])
      const prediction = await maskDetector.predict(re)
      const res = await prediction.data()
      const {"0": moi, "1": nor} = res
      setMoire(moi)
      setNormal(nor)
      
      console.log(JSON.stringify(res))
      // for (let i = 0; i < 2; i++) {
      //       const classPrediction =
      //           prediction[i]
      //       console.log(classPrediction)
      //       // labelContainer.childNodes[i].innerHTML = classPrediction;
      //   }
      
    }
  return (
    <View style={styles.container}>
      <Input 
        placeholder="image link"
        onChangeText = {(inputText)=>{
          console.log(inputText)
          setImageLink(inputText)
          const elements= inputText.split(".")
          if(elements.slice(-1)[0]=="jpg" || elements.slice(-1)[0]=="jpeg"){
            setIsEnabled(true)
          }else{
            setIsEnabled(false)
          }
        }}
        value={imageLink}
        containerStyle={{height:40,fontSize:10,margin:15}} 
        inputContainerStyle={{borderRadius:10,borderWidth:1,paddingHorizontal:5}}  
        inputStyle={{fontSize:15}}
      
      />
      <View style={{marginBottom:20}}>
        <Image
          style={{width:224,height:224,borderWidth:2,borderColor:"black",resizeMode: "contain"}}
          source={{
            uri: imageLink
          }}
          PlaceholderContent={<View>No Image Found</View>}
        />
        {/* <Svg height="224" width="224" style={{marginTop:-224}}>
          {
            faces.map((face)=>{
              return (
                <Rect
                  key={face.id}
                  x={face.location.topLeft[0]}
                  y={face.location.topLeft[1]}
                  width={(face.location.bottomRight[0] - face.location.topLeft[0])}
                  height={(face.location.bottomRight[1] - face.location.topLeft[1])}
                  stroke={face.color}
                  strokeWidth="3"
                  fill=""
                />
              )
            })
          }   
        </Svg> */}
      </View>
      <View>

        <Text>Moire: {moire * 100}%</Text>
        <Text>Normal: {normal * 100}%</Text>

      </View>
        <Button 
          title="Predict"
          onPress={()=>{predict()}}
          disabled={!isEnabled}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


// import React from 'react';
// import { StyleSheet, Text, View } from 'react-native';
// import TFCamera from './TFCamera'

// export default function App() {
//   return (
//     <View style={styles.container}>
//        <TFCamera />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
