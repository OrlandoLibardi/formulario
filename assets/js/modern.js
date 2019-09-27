/**
 * Validador
 */
(function($) {
    "use strict";
    $.fn.m = function(options, callback) {
        var $el = $(this);
        var defaults = {
            id : 'm-' + Math.floor((Math.random() * 100) + 1),
            show_text : true,
            errors : [{
                'not-null' : 'Esse campo é obrigatório!',
                'string'   : 'Você não pode usar caracteres especiais aqui!',
                'min'      : 'Esse campo precisa ter ao menos %VAL% caracteres!',
                'max'      : 'Esse campo precisa ter no máximo %VAL% caracteres!',
                'email'    : 'Esse não é um endereço de e-mail valido!',
                'input-confirm' : 'O valor desse campo deve ser idêntico ao %VAL%!',
                'cpf'        : 'CPF inválido!',
                'cep'        : 'CEP inválido!',
                'numeric'    : 'Isso não é um número!',
                'min-number' : 'O valor desse campo deve ser maior que %VAL%!',
                'max-number' : 'O valor desse campo deve ser menor que %VAL%!',
                'date-br'    : 'Isso não é uma data válida',
            }]
        };
        var settings = $.extend({}, defaults, options),
            inputs   = "form[data-m-form="+settings.id+"] .my-form-input > input, form[data-m-form="+settings.id+"] .my-form-input > select, form[data-m-form="+settings.id+"] .my-form-input > textarea",
            last_error = [];

        /**
         * init 
         */
        function init(){
            var data_id = 0;
            $el.attr("data-m-form", settings.id);
            $el.find('.my-form-input').each(function(){                
                initMask($('input, select, textarea', this));
                $(this).attr("data-id", data_id);
                var text_validate = '<div class="border-validator" data-id="'+data_id+'"></div>' +
                                    '<span class="icon-validation" data-id="'+data_id+'"></span>' + 
                                    '<span class="text-validation" data-id="'+data_id+'"></span>';
                $('input, select, textarea', this).attr("data-input", data_id).after(text_validate);
                data_id++;
               
            });

        }
        /*            
        * Verifica todos os campos
        */
        function checkAllInputs(id){
            var error_count = 0;    
            $("form[data-m-form="+id+"]").find("input, select, textarea").each(function(){                
                if(getRules($(this).attr("data-validate"), $(this))===false){
                    errorFeedback($(this).attr("data-input"));
                    error_count++;
                }
                else{
                    successFeedback($(this).attr("data-input"));
                }                
            });

            return error_count;
        }
        /**
        * Lê as regras de validação do input e ativa a função
        * @param string validate, object $this
        * return bool
        */
        function getRules(validate, $this){
            if(validate){
                var t_rules = validate.split("|");
                for(var key in t_rules){
                    if(t_rules[key].indexOf(":") > -1){
                        var temp = t_rules[key].split(":"); 
                        if(!eval(renameFunction(temp[0]))($this, temp[1])){
                            setLastError($this.attr("data-input"), temp[0], temp[1]);
                            setLastError()
                            return false;
                        }
                    }
                    else{
                        if(!eval(renameFunction(t_rules[key]))($this)){
                            setLastError($this.attr("data-input"), t_rules[key]);
                            return false;
                        }
                    }                     
                }
                return true;
            }
            
            return true;
        }
        /**
         * Ultimo erro por input
        */
        function setLastError(input_id, key_error, str=false){
            
            if(!input_id) return false;

            var error_temp = settings.errors[0][key_error];

            if(str!=false) error_temp = error_temp.replace("%VAL%", str);

            last_error[input_id] = error_temp;

        } 
        /**
        * Transforma o termo de validação na função 
        * @params string function_name
        * @return funtion
        */
        function renameFunction(f){
            f = f.split("-");
            var r = 'validate';
            for(var key in f){
                r += f[key].charAt(0).toUpperCase() + f[key].slice(1);
            }
            return r;
        }     
        /**
        * Not-null
        * @param $this
        * @return bool
        */
        function validateNotNull($this){
            if ($this.val() === "") return false;
            return true;
        }
        /**
        * String 
        * @param $this
        * @return bool
        */
        function validateString($this){
            return typeof $this.val() === 'string';
        }
        /**
        * Email
        * @param $this
        * @return bool
        */
        function validateEmail($this){
            var re = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/gi;        
            return re.test($this.val()); 
        }
        /**
        * Numeric
        * @param $this
        * @return bool
        */
        function validateNumeric($this){
            return !isNaN($this.val());
        }
        /**
        * Min
        * @param $this
        * @return bool
        */
        function validateMin($this, number){
            var count = $this.val().length;
            return count >= number;
        }
        /**
        * Max
        * @param $this, number
        * @return bool
        */
        function validateMax($this, number){
            var count = $this.val().length;
            return count <= number;
        }
        /**
        * Confirm value
        * @param $this, input
        * @return bool
        */
        function validateInputConfirm($this, _input){
            return $this.val() === $('input[name='+_input+']').val();
        }
        /**
        * Min number
        * @param $this, number
        * @return bool
        */
        function validateMinNumber($this, number){
            return $this.val() >= number;
        }
        /**
        * Max number
        * @param $this, number
        * @return bool
        */
        function validateMaxNumber($this, number){
            var _value = parseInt($this.val()),
                _number = parseInt(number);
            return _number >= _value;
        }
        /**
         * Date br 
         * @param $this
         * @return bool
         */
        function validateDateBr($this){            
            var _val = $this.val().replace(/\D/g, ""), d = parseInt(_val[0]+""+""+_val[1]), m = parseInt(_val[2]+""+""+_val[3]);
            if(_val.length != 8) return false; 
            if(d == 0 || d > 31 || m > 12 || m == 0) return false;
            return true;
        }
        /**
         * Verifica se um valor é uma sequencia de números iguais
         * @param $this, _digits
         * @return bool
        */
        function checkSequence($this, _digits){
            var _value = $this.val(), _check = numberSequence(_digits);
            for(var key in _check){
                if(_check[key] == _value){
                    return false;
                }
            }
            return true;
        }
        /**
         * Cria uma sequencia 0 a 9 de numeros iguais
         * @param _digits
         * @return _check array
         */
        function numberSequence(_digits){
            var _check = [];
            for(var i = 0; i <= 9; i++){
                var _temp = "";
                for(var ii = 0; ii < _digits;  ii++){
                    _temp += "" + i;
                }
                _check.push(_temp)
            }
            return _check;
        }
        /**
        * CPF
        * @param $this
        * @return bool
        */
       function validateCpf($this) {
            var _sun = 0, _rest, _val = $this.val().replace(/\D/g, "");
            if(checkSequence($this, 11) == false) return false;
            if (_val.length != 11) return false;
            for (var i = 1; i <= 9; i++) _sun = _sun + parseInt(_val.substring(i - 1, i)) * (11 - i);
            _rest = (_sun * 10) % 11;
        
            if ((_rest == 10) || (_rest == 11)) _rest = 0;
            if (_rest != parseInt(_val.substring(9, 10))) return false;
        
            _sun = 0;
            for (var i = 1; i <= 10; i++) _sun = _sun + parseInt(_val.substring(i - 1, i)) * (12 - i);
            _rest = (_sun * 10) % 11;
        
            if ((_rest == 10) || (_rest == 11)) _rest = 0;
            if (_rest != parseInt(_val.substring(10, 11))) return false;
            return true;
        }        
        /**
        * CEP
        * @param $this
        * @return bool
        */   
       function validateCep($this){
           var _value = $this.val().replace(/\D/g, ""),
               _count = _value.length,
               _check = 0;
           
           if((_count < 5) || (_count > 5 && _count != 8)) return false;  
           
           for(var i=0; i <= _count; i++){
              if(_value[i] >= 0 && _value[i] <= 9){
                _check++;
              }              
           }   
           return (_check == _count) ? true : false; 
       }     
       /**
        * Mascaras
       */
       function initMask($this){
           if($this.attr("data-mask")!= undefined){
                var _mask = setMask(arrayMask($this.attr("data-mask")));
                $this.attr("data-mask", _mask).addClass("data-mask");
           }
       }
       function arrayMask(_val){
            var _p = [], _a = "", _t = _val.length;
            for(var i = 0; i < _t; i++){ 
                if(!isNaN(_val[i])){
                    _a += _val[i];
                }
                else{ 
                    _p.push(_a);
                    _p.push(_val[i]);         
                    _a = "";
                }
                if(i == (_t-1)) _p.push(_a);
            }
            return _p;
        }
        function setMask(_mask){
            var _a = "", _b = "", _c = 1;
            for(var i=0; i<_mask.length; i++){
                if(!isNaN(_mask[i])){
                    var _d = "" + _mask[i];
                        _a += '(\\d{' + _d.length + '})';
                        _b += "\\$"+_c+"";
                }else{
                    _b += _mask[i]+"";
                    _c++;
                }
            }
            return '/'+_a+'/g,'+ '"'+ _b + '"'; 
        }
        /*
        * Feedbacks inputs
        */
        function clearFeedback(data_id){           
            $('.text-validation[data-id='+data_id+']').removeClass("success").removeClass("error").html('');
            $('.border-validator[data-id='+data_id+']').removeClass("success").removeClass("error");
            $('.icon-validation[data-id='+data_id+']').removeClass("success").removeClass("error");
        }
        function successFeedback(data_id){            
           // $('.text-validation[data-id='+data_id+']').addClass("success").html('Tudo certo!');
            $('.border-validator[data-id='+data_id+']').addClass("success");
            $('.icon-validation[data-id='+data_id+']').addClass("success");
        }
        function errorFeedback(data_id){  
            if(settings.show_text===true){
                $('.text-validation[data-id='+data_id+']').addClass("error").html(last_error[data_id]);
            }
            $('.border-validator[data-id='+data_id+']').addClass("error");
            $('.icon-validation[data-id='+data_id+']').addClass("error");
        }    
        /* Eventos */
        /* 
        * Cria o evento observador para click para os campos do formulário
        */
        $(document).on("click", inputs, function(){
            clearFeedback($(this).attr("data-input"));                
        });
        /* 
        * Cria o evento observador para o evento change dos campos
        */
        $(document).on("change", inputs, function(){
            if(getRules($(this).attr("data-validate"), $(this))===false){
                errorFeedback($(this).attr("data-input"));
            }
            else{
                successFeedback($(this).attr("data-input"));
            }
        });
        /*
        * Submit no form
        */
        $el.on("submit", function(e){
            e.preventDefault();
            e.stopPropagation();
            var _check_error_inputs = checkAllInputs($(this).attr("data-m-form"));
            if( _check_error_inputs == 0){
              $el.submit();
            }
        });

        $(document).on("keypress", '.data-mask', function(){
            var _this = $(this);
            setTimeout(function(){
                //_this.val(_this.val().replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g,"\$1.\$2.\$3-\$4"));
            },1);
        });

        /*
          
        */
       $(document).ready(function(){
            $("form[data-m-form="+settings.id+"]").find("input, select, textarea").each(function(){
                if($(this).val()!=""){
                    if(getRules($(this).attr("data-validate"), $(this))===false){
                        errorFeedback($(this).attr("data-input"));
                    }
                    else{
                        successFeedback($(this).attr("data-input"));
                    }
                }   
            });
       });
        //return
        return init();
    }
}(jQuery));