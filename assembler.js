const TIPO_R = '0';
const TIPO_J = '36';

// Metodo principal.
// Analisa comando, chama as funcoes necessarias e manda imprimir.
function compilar()
{
	// limpar tabelas
	var tabela = document.getElementById('tabela-binario');
	tbody = tabela.getElementsByTagName('tbody')[0];
	tbody.innerHTML = '';
	var tabela = document.getElementById('tabela-verdade');
	tbody = tabela.getElementsByTagName('tbody')[0];
	tbody.innerHTML = '';
	
	var instrucoes = document.getElementById('instrucoes'); // div com as instrucoes
	var divs = instrucoes.getElementsByTagName('div'); // divs de dentro - cada uma eh uma instrucao
	
	// para cada instrucao
	for (var i = 0; i < divs.length; i++) {
		try {
			// select - operacao selecionada
			var op_funct = divs[i].getElementsByTagName('select')[0];
			op_funct_selected = op_funct.options[op_funct.selectedIndex];
			var instrucao = op_funct_selected.value;
			var op = Number(op_funct_selected.getAttribute('data-op'));
			var funct = Number(op_funct_selected.getAttribute('data-funct'));
			
			// input - comando digitado
			var comandos = divs[i].getElementsByTagName('input')[0].value;
			comandos = comandos.replace(/\$/g, '').replace(/\s/g, ''); // remover espacos e $
			
			if (!empty(comandos)) {
				comandos = comandos.split(','); // dividir comando pela virgula
				
				var rd = 0;
				var rs = 0;
				var rt = 0;
				var imm = 0;
				var addr = 0;
				
				if (op == TIPO_R) {
					rd = Number(comandos[0]);
					rs = Number(comandos[1]);
					if (instrucao != 'not') {
						rt = Number(comandos[2]);
					}
				} else if (op == TIPO_J) {
					addr = Number(comandos[0]);
				} else {
					rt = Number(comandos[0]);
					if (instrucao == 'lw' || instrucao == 'sw') {
						var index1 = comandos[1].indexOf('(');
						var index2 = comandos[1].indexOf(')');
						imm = comandos[1].substring(0, index1);
						rs = comandos[1].substring(index1+1, index2);
					} else {
						rs = Number(comandos[1]);
						imm = Number(comandos[2]);
					}
				}
				imprimir(instrucao, op, rs, rt, rd, funct, imm, addr);
			} // if empty
		} catch (error) {}
	} // for
}

// Imprime tabela com saida
function imprimir(instrucao, op, rs, rt, rd, funct, imm, addr)
{
	// TABELA BINARIO
	
	var tr = document.createElement('tr');
	
	// op
	var td = document.createElement('td');
	var legenda = document.createElement('small');
	legenda.innerHTML = 'op<br />';
	td.appendChild(legenda);
	td.innerHTML = td.innerHTML + dec2Bin(op, 6);
	tr.appendChild(td);
	
	if (op == TIPO_J) { 
		// addr
		var td = document.createElement('td');
		td.colSpan = 5;
		var legenda = document.createElement('small');
		legenda.innerHTML = 'addr<br />';
		td.appendChild(legenda);
		td.innerHTML = td.innerHTML + dec2Bin(addr, 26);
		tr.appendChild(td);
	} else {
		// rs
		var td = document.createElement('td');
		var legenda = document.createElement('small');
		legenda.innerHTML = 'rs<br />';
		td.appendChild(legenda);
		td.innerHTML = td.innerHTML + dec2Bin(rs, 5);
		tr.appendChild(td);
		
		// rt
		var td = document.createElement('td');
		var legenda = document.createElement('small');
		legenda.innerHTML = 'rt<br />';
		td.appendChild(legenda);
		td.innerHTML = td.innerHTML + dec2Bin(rt, 5);
		tr.appendChild(td);
		
		if (op == TIPO_R) {
			// rd
			var td = document.createElement('td');
			var legenda = document.createElement('small');
			legenda.innerHTML = 'rd<br />';
			td.appendChild(legenda);
			td.innerHTML = td.innerHTML + dec2Bin(rd, 5);
			tr.appendChild(td);
			
			// shamt
			var td = document.createElement('td');
			var legenda = document.createElement('small');
			legenda.innerHTML = 'shamt<br />';
			td.appendChild(legenda);
			td.innerHTML = td.innerHTML + dec2Bin(0, 5);
			tr.appendChild(td);
			
			// funct
			var td = document.createElement('td');
			var legenda = document.createElement('small');
			legenda.innerHTML = 'funct<br />';
			td.appendChild(legenda);
			td.innerHTML = td.innerHTML + dec2Bin(funct, 6);
			tr.appendChild(td);
		} else {
			// imm
			var td = document.createElement('td');
			td.colSpan = 3;
			var legenda = document.createElement('small');
			legenda.innerHTML = 'imm<br />';
			td.appendChild(legenda);
			td.innerHTML = td.innerHTML + dec2Bin(imm, 16);
			tr.appendChild(td);
		}
	}

	var tabela = document.getElementById('tabela-binario');
	tbody = tabela.getElementsByTagName('tbody')[0];
	tbody.appendChild(tr);
	tabela.style.display = 'table';

	// TABELA VERDADE
	
	// definir valores
	var regDst = 'X';
	if (op == TIPO_R) {
		regDst = 1;
	} else if (instrucao == 'lw' || instrucao == 'addi' || instrucao == 'subi') {
		regDst = 0;
	}
	var regWrite = (op == TIPO_R || instrucao == 'lw' || instrucao == 'addi') ? 1 : 0;
	var memToReg = 0;
	if (instrucao == 'lw') {
		memToReg = 1;
	}
	var memRead = (instrucao == 'lw') ? 1 : 0;
	var memWrite = (instrucao == 'sw') ? 1 : 0;
	var branch = 0;
	if (instrucao == 'beq') {
		branch = 1;
	} else if (instrucao == 'j') {
		branch = 'X';
	}
	var pcSrc = 0;
	if (instrucao == 'j' || instrucao == 'beq') {
		pcSrc = 1;
	}
	var aluSrc = 1;
	if (instrucao == 'j') {
		aluSrc = 'X';
	} else if (op == TIPO_R || instrucao == 'beq') {
		aluSrc = 0;
	}
	var aluOp = op;
	if (op == TIPO_J) {
		aluOp = 0;
	} else if (op == TIPO_R) {
		aluOp = funct;
	}
	var jump = (instrucao == 'j') ? 1 : 0;
	
	var tr = document.createElement('tr');
	
	// instrucao
	var td = document.createElement('td');
	td.innerHTML = instrucao;
	tr.appendChild(td);
	
	// regDst
	var td = document.createElement('td');
	td.innerHTML = regDst;
	tr.appendChild(td);
	
	// regWrite
	var td = document.createElement('td');
	td.innerHTML = regWrite;
	tr.appendChild(td);
	
	// memToReg
	var td = document.createElement('td');
	td.innerHTML = memToReg;
	tr.appendChild(td);
	
	// memRead
	var td = document.createElement('td');
	td.innerHTML = memRead;
	tr.appendChild(td);
	
	// memWrite
	var td = document.createElement('td');
	td.innerHTML = memWrite;
	tr.appendChild(td);
	
	// branch
	var td = document.createElement('td');
	td.innerHTML = branch;
	tr.appendChild(td);
	
	// pcSrc
	var td = document.createElement('td');
	td.innerHTML = pcSrc;
	tr.appendChild(td);
	
	// aluSrc
	var td = document.createElement('td');
	td.innerHTML = aluSrc;
	tr.appendChild(td);
	
	// aluOp
	var td = document.createElement('td');
	td.innerHTML = dec2Bin(aluOp, 6);
	tr.appendChild(td);
	
	// jump
	var td = document.createElement('td');
	td.innerHTML = jump;
	tr.appendChild(td);
	
	var tabela = document.getElementById('tabela-verdade');
	tbody = tabela.getElementsByTagName('tbody')[0];
	tbody.appendChild(tr);
	tabela.style.display = 'table';
}

// Converte decimal para binario
function dec2Bin(number, length)
{
	length = empty(length) ? 16 : length; // tamanho padrao 16 bits
	number = Number(number); // cast
	var pad;
	// se o num for menor que 0, preencher com 1, se nao, preencher com 0
	if (number < 0) {
		number = (number >>> 0); // complemento de 2
		pad = '1';
	} else {
		pad = '0';
	}
	number = number.toString(2).substr(-length); // converter para binario e cortar para length
    while (number.length < length) {
        number = pad + number; // preencher numero a esquerda
    }
    return number;
}

// Adiciona linha para nova instrucao
function add()
{
	var instrucoes = document.getElementById('instrucoes');
	var divs = instrucoes.getElementsByTagName('div');
	instrucoes.appendChild(divs[0].cloneNode(true));
	// limpar input clonado
	var last = divs[divs.length-1];
	last.getElementsByTagName('input')[0].value = '';
}

// Verifica se string esta vazia
function empty(str)
{
	if (str == undefined || str == null || str == '' || str == 0) {
		return true;
	}
	return false;
}

// Mostra/esconde ajuda
function ajuda()
{
	var ajuda = document.getElementById('ajuda');
	ajuda.style.display == 'block' ? ajuda.style.display = 'none' : ajuda.style.display = 'block';
}