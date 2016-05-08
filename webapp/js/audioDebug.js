(function(window) {
	var AudioDebugger = function(config) {
		
		var bufferLength = 2048;
		var sampleRate = config.sampleRate || 16000;
		var context = new (window.AudioContext || window.webkitAudioContext)();
		var analyser = context.createAnalyser();
		var canvas = config.canvas;
		var playSpeakers = false;
		
        analyser.smoothingTimeConstant = 0;
        analyser.fftSize = 2048;
		
		var proc = context.createScriptProcessor(bufferLength);
		proc.connect(context.destination);
		analyser.connect(proc);
		
		proc.onaudioprocess = function (audioProcessingEvent) {
		    
		    if(playSpeakers) {
                var inputBuffer = audioProcessingEvent.inputBuffer;
                var outputBuffer = audioProcessingEvent.outputBuffer;
                
                for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
                    var inputData = inputBuffer.getChannelData(channel);
                    var outputData = outputBuffer.getChannelData(channel);
                
                    for (var sample = 0; sample < inputBuffer.length; sample++) {
                      outputData[sample] = inputData[sample];
                    }
                }
		    } else {
		        var outputBuffer = audioProcessingEvent.outputBuffer;
                
                for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
                    var outputData = outputBuffer.getChannelData(channel);
                    
                    for (var sample = 0; sample < outputBuffer.length; sample++) {
                      outputData[sample] = 0;
                    }
                }
		    }
		    
		    if(!canvas) {
                return;
            }
            
            draw();
        };
        
        function draw() {
          
          var ctx = canvas.getContext('2d');
          
          var dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          
          var w = canvas.width;
          var h = canvas.height;
          
          ctx.fillStyle = 'rgb(200, 200, 200)';
          ctx.fillRect(0, 0, w, h);
          
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgb(0, 0, 0)';
    
          ctx.beginPath();
        
          var sliceWidth = w * 1.0 / dataArray.length;
          var x = 0;
    
          for(var i = 0; i < dataArray.length; i++) {
       
            var v = dataArray[i] / 128.0;
            var y = v * h/2;
    
            if(i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
          }
          
          ctx.lineTo(w, h/2);
          ctx.stroke();
        };
        
	    var srcBuffer = context.createBuffer(1, config.bufferLength, sampleRate);
	    
		this.process = function(buffer) {
		    
    		var nowbuf = srcBuffer.getChannelData(0);
    		for(var i=0; i<buffer.length; i++) {
    			nowbuf[i] = buffer[i];
    		}
    		
    		var src = context.createBufferSource();
    		src.buffer = srcBuffer;
    		src.connect(analyser);
    		src.start();
		}
		
		//WARNING: Only enable with headphones!
		this.toggleSpeakers = function(isOn) {
		    playSpeakers = isOn;
		}
	};
	window.AudioDebugger = AudioDebugger;
})(window);
