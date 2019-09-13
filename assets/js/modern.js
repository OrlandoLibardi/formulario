/**
 * Validador
 */
(function($) {
    "use strict";
    $.fn.m = function(options, callback) {
        var $el = $(this);
        var defaults = {
            id : 'm-' + Math.floor((Math.random() * 100) + 1),
            'errors' : [{
                'not-null' : 'Esse campo é obrigatório!',
                'string'   : 'Você não pode usar caracteres especiais aqui!',
                'min'      : 'Esse campo precisa ter ao menos %number% caracteres!',
                'max'      : 'Esse campo precisa ter no máximo %number% caracteres!',
                'email'    : 'Esse não é um endereço de e-mail valido!',
                'input-confirm' : 'O valor desse campo deve ser idêntico ao %input%!',
                'cpf' : 'CPF inválido!',
                'cep' : 'CEP inválido!',
                'numeric' : 'Isso não é um número!',
                'min-number' : 'O valor desse campo deve ser maior que %number%!',
                'max-number' : 'O valor desse campo deve ser menor que %number%!'
            }]
        };
        var settings = $.extend({}, defaults, options);
        var inputs   = "form[data-m-form="+settings.id+"] .my-form-input > input, form[data-m-form="+settings.id+"] .my-form-input > select, form[data-m-form="+settings.id+"] .my-form-input > textarea";
        /* init() */
        function init(){
            /* Iniciando o formulário */
            var data_id = 0;
            $el.attr("data-m-form", settings.id);
            $el.find('.my-form-input').each(function(){                
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
        /*
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
                            return false;
                        }
                    }
                    else{
                        if(!eval(renameFunction(t_rules[key]))($this)){
                            return false;
                        }
                    }                     
                }
                return true;
            }
            
            return true;
        }
        /*
        * Transforma o termos de validação na funcão 
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
        /*
        * Functions Validate
        */
        /*
        * Not-null
        * @param $this
        * @return bool
        */
        function validateNotNull($this){
            if ($this.val() === "") return false;
            return true;
        }
        /*
        * String 
        * @param $this
        * @return bool
        */
        function validateString($this){
            return typeof $this.val() === 'string';
        }
        /*
        * Email
        * @param $this
        * @return bool
        */
        function validateEmail($this){
            var re = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/gi;        
            return re.test($this.val()); 
        }
        /*
        * Numeric
        * @param $this
        * @return bool
        */
        function validateNumeric($this){
            return !isNaN($this.val());
        }
        /*
        * Min
        * @param $this
        * @return bool
        */
        function validateMin($this, number){
            var count = $this.val().length;
            return count >= number;
        }
        /*
        * Max
        * @param $this, number
        * @return bool
        */
        function validateMax($this, number){
            var count = $this.val().length;
            return count <= number;
        }
        /*
        * Confirm value
        * @param $this, input
        * @return bool
        */
        function validateInputConfirm($this, _input){
            return $this.val() === $('input[name='+_input+']').val();
        }
        /*
        * Min number
        * @param $this, number
        * @return bool
        */
        function validateMinNumber($this, number){
            return $this.val() >= number;
        }
        /*
        * Max number
        * @param $this, number
        * @return bool
        */
        function validateMaxNumber($this, number){
            var _value = parseInt($this.val()),
                _number = parseInt(number);
            return _number >= _value;
        }
        /*
        * CPF
        * @param $this
        * @return bool
        */
        function validateCpf($this){

        }
        /*
        * CEP
        * @param $this
        * @return bool
        */   
       function validateCep($this){
           var _value = $this.val().replace(/\D/g, ""),
               _count = _value.length;

           //menor que 5 ou maior q 5 e menor que 8 OU 
           if((_count < 5) || (_count > 5 && _count < 8)){
              return false;    
           }   
           var check = 0;
           for(var i=0; i <= _count; i++){
              if(_value[i] >= 0 && _value[i] <= 9){
                    check++;
              }
           }   
           return (check == _count) ? true : false; 
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
            $('.text-validation[data-id='+data_id+']').addClass("error").html('Erro!');
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
        * Cria o evento observador para change para os campos do formulário
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